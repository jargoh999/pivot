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

    // Reset unread count for the current user in this conversation
    const userIdStr = userId.toString();
    if (conversation.unreadCount) {
      const currentUnread = conversation.unreadCount.get(userIdStr) || 0;
      if (currentUnread > 0) {
        conversation.unreadCount.set(userIdStr, 0);
        await conversation.save();
      }
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    // Build query
    const query: any = { conversationId: id };
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .populate('senderId', 'fullName profilePhoto')
      .populate('replyTo.messageId', 'text senderId')
      .sort({ createdAt: 1 });

    // Format messages for frontend
    const formattedMessages = messages.map((msg: any) => {
      const isMe = msg.senderId._id.toString() === userId;
      
      // Format replyTo information
      let replyTo = undefined;
      if (msg.replyTo && msg.replyTo.messageId) {
        const replyMsg = msg.replyTo.messageId;
        const isReplyToMe = replyMsg.senderId.toString() === userId;
        replyTo = {
          id: replyMsg._id.toString(),
          text: replyMsg.text,
          author: isReplyToMe ? 'me' : 'them',
        };
      }

      return {
        id: msg._id.toString(),
        author: isMe ? 'me' : 'them',
        text: msg.text,
        audioData: msg.audioData,
        audioDuration: msg.audioDuration,
        imageData: msg.imageData,
        reactions: (msg.reactions || []).map((r: any) => ({
          userId: r.userId.toString(),
          emoji: r.emoji,
        })),
        timestamp: msg.createdAt.toISOString(),
        replyTo,
      };
    });

    return NextResponse.json({
      messages: formattedMessages,
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
