import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import { authMiddleware } from '@/lib/middleware/auth';

export async function POST(req: Request) {
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
    const { conversationId, text, replyTo, audioData, audioDuration, imageData } = await req.json();

    // Validate input
    if (!conversationId || (!text && !audioData && !imageData)) {
      return NextResponse.json(
        { error: 'Conversation ID and either text, audio, or image data are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId as any)) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Find the other participant
    const receiverId = conversation.participants.find(
      (p: any) => p.toString() !== userId
    );

    let messageText = '';
    if (audioData) {
      messageText = '🎤 Voice Note';
    } else if (imageData) {
      messageText = '📷 Photo';
    } else {
      messageText = text.trim();
    }

    // Create new message
    const newMessage = new Message({
      senderId: userId,
      receiverId,
      conversationId,
      text: messageText,
      audioData,
      audioDuration,
      imageData,
      replyTo: replyTo ? {
        messageId: replyTo.id,
        text: replyTo.text,
        author: replyTo.author,
      } : undefined,
    });

    await newMessage.save();

    // Update conversation's last message
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();

    // Increment unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);

    await conversation.save();

    // Format response
    const formattedMessage = {
      id: newMessage._id.toString(),
      author: 'me',
      text: newMessage.text,
      audioData: newMessage.audioData,
      audioDuration: newMessage.audioDuration,
      imageData: newMessage.imageData,
      reactions: [],
      timestamp: newMessage.createdAt.toISOString(),
      replyTo: replyTo,
    };

    return NextResponse.json({
      message: formattedMessage,
      conversationId: conversationId,
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
