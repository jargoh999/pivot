import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { authMiddleware } from '@/lib/middleware/auth';

export async function GET(req: Request) {
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

    // Connect to database
    await connectDB();

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('lastMessage')
      .populate('participants', 'fullName profilePhoto')
      .sort({ updatedAt: -1 });

    // Format conversations for frontend
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== userId
        );

        // Get unread count for this user
        const unreadCount = conv.unreadCount.get(userId.toString()) || 0;

        // Get last message details
        let lastMessageText = '';
        let lastMessageTime = '';
        let lastMessageAuthor = '';

        if (conv.lastMessage) {
          const lastMsg = await Message.findById(conv.lastMessage._id);
          if (lastMsg) {
            lastMessageText = lastMsg.text;
            lastMessageTime = new Date(lastMsg.createdAt).toLocaleString();
            lastMessageAuthor = lastMsg.senderId.toString() === userId ? 'You: ' : '';
          }
        }

        return {
          id: conv._id.toString(),
          name: otherParticipant?.fullName || 'Unknown',
          avatar: otherParticipant?.profilePhoto || '/placeholder.svg',
          lastMessage: lastMessageAuthor + lastMessageText,
          time: lastMessageTime,
          unread: unreadCount,
          isTyping: false, // Will be updated via SSE
        };
      })
    );

    return NextResponse.json({
      conversations: formattedConversations,
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
