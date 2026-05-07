import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    if (code.length !== 4 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check verification code
    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Update user as verified
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      $unset: {
        emailVerificationCode: 1,
        emailVerificationExpires: 1,
      },
    });

    // Generate JWT token
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: true,
      birthDate: user.birthDate,
      profilePhoto: user.profilePhoto,
    };

    return NextResponse.json({
      message: 'Email verified successfully',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
