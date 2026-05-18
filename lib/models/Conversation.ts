import mongoose, { Schema } from 'mongoose';

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'pivot-user',
    required: true,
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'pivot-message',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map(),
  },
}, {
  timestamps: true,
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Create and export the model
const Conversation = mongoose.models['pivot-conversation'] || mongoose.model('pivot-conversation', conversationSchema);

export default Conversation;
