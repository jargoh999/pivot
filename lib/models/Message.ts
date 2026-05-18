import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'pivot-user',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'pivot-user',
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'pivot-conversation',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  replyTo: {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'pivot-message',
    },
    text: {
      type: String,
    },
    author: {
      type: String,
      enum: ['me', 'them'],
    },
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create and export the model
const Message = mongoose.models['pivot-message'] || mongoose.model('pivot-message', messageSchema);

export default Message;
