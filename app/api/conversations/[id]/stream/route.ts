import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import { authMiddleware } from '@/lib/middleware/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | any }
) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;
    const { id } = await params;

    // Connect to database
    await connectDB();

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(userId as any)) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const encoder = new TextEncoder();

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

          // Watch for new messages and reactions using MongoDB change stream
          const changeStream = Message.watch([
            {
              $match: {
                'fullDocument.conversationId': conversation._id,
              },
            },
          ], { fullDocument: 'updateLookup' });
 
          changeStream.on('change', async (change) => {
            if (change.operationType === 'insert') {
              const newMessage = await Message.findById(change.documentKey._id)
                .populate('senderId', 'fullName profilePhoto')
                .populate('replyTo.messageId', 'text senderId');
 
              if (newMessage) {
                const isMe = newMessage.senderId._id.toString() === userId;
                
                let replyTo = undefined;
                if (newMessage.replyTo && newMessage.replyTo.messageId) {
                  const replyMsg = newMessage.replyTo.messageId;
                  const isReplyToMe = replyMsg.senderId.toString() === userId;
                  replyTo = {
                    id: replyMsg._id.toString(),
                    text: replyMsg.text,
                    author: isReplyToMe ? 'me' : 'them',
                  };
                }
 
                const formattedMessage = {
                  type: 'new_message',
                  data: {
                    id: newMessage._id.toString(),
                    author: isMe ? 'me' : 'them',
                    text: newMessage.text,
                    audioData: newMessage.audioData,
                    audioDuration: newMessage.audioDuration,
                    imageData: newMessage.imageData,
                    reactions: (newMessage.reactions || []).map((r: any) => ({
                      userId: r.userId.toString(),
                      emoji: r.emoji,
                    })),
                    timestamp: newMessage.createdAt.toISOString(),
                    replyTo,
                  },
                };
 
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(formattedMessage)}\n\n`));
              }
            } else if (change.operationType === 'update') {
              const updatedMessage = await Message.findById(change.documentKey._id);
              if (updatedMessage) {
                const formattedReactionUpdate = {
                  type: 'message_update',
                  data: {
                    id: updatedMessage._id.toString(),
                    reactions: (updatedMessage.reactions || []).map((r: any) => ({
                      userId: r.userId.toString(),
                      emoji: r.emoji,
                    })),
                  },
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(formattedReactionUpdate)}\n\n`));
              }
            }
          });

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }, 30000);

          // Cleanup on client disconnect
          req.signal.addEventListener('abort', () => {
            clearInterval(heartbeat);
            changeStream.close();
            controller.close();
          });

        } catch (error) {
          console.error('SSE stream error:', error);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('SSE endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
