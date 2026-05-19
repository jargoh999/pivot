import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  birthDate: {
    type: Date,
  },
  profilePhoto: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  // Profile fields
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
  },
  country: {
    type: String,
  },
  timezone: {
    type: String,
  },
  industry: {
    type: String,
  },
  experienceLevel: {
    type: String,
    enum: ['student', 'entry', 'mid', 'senior', 'executive'],
  },
  interests: {
    type: [String],
    default: [],
  },
  intentions: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.models['pivot-user'] || mongoose.model('pivot-user', userSchema);

export default User;
