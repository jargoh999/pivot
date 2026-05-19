import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Conversation from '@/lib/models/Conversation';
import { authMiddleware } from '@/lib/middleware/auth';

export async function POST(
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
    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the message
    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is participant of the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation || !conversation.participants.includes(userId as any)) {
      return NextResponse.json(
        { error: 'Unauthorized to react to this message' },
        { status: 403 }
      );
    }

    // Toggle reaction logic
    const userIdStr = userId.toString();
    const existingReactionIndex = (message.reactions || []).findIndex(
      (r: any) => r.userId.toString() === userIdStr
    );

    if (existingReactionIndex > -1) {
      const existingEmoji = message.reactions[existingReactionIndex].emoji;
      if (existingEmoji === emoji) {
        // Same emoji: remove reaction
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Different emoji: update reaction
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // New reaction: add
      message.reactions.push({
        userId,
        emoji,
      });
    }

    await message.save();

    // Format updated reactions response
    const formattedReactions = message.reactions.map((r: any) => ({
      userId: r.userId.toString(),
      emoji: r.emoji,
    }));

    return NextResponse.json({
      reactions: formattedReactions,
    });

  } catch (error) {
    console.error('Toggle reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
