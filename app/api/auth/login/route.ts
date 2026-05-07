import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate new verification code if email is not verified
    if (!user.isEmailVerified) {
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await User.findByIdAndUpdate(user._id, {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt,
      });

      // Send verification email
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL!,
          to: email,
          subject: 'Verify your Vibe Chat account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e83f55; margin: 0;">Vibe Chat</h1>
              </div>
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
              <p style="color: #666; margin-bottom: 20px;">Please use the verification code below to complete your login:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #e83f55; letter-spacing: 5px;">${verificationCode}</span>
              </div>
              <p style="color: #666; margin-bottom: 20px;">This code will expire in 10 minutes.</p>
              <p style="color: #666; margin-bottom: 20px;">If you didn't request this verification, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 Vibe Chat. All rights reserved.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      return NextResponse.json({
        message: 'Please verify your email before logging in. A new verification code has been sent.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Generate JWT token
    //@ts-ignore
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
      isEmailVerified: user.isEmailVerified,
      birthDate: user.birthDate,
      profilePhoto: user.profilePhoto,
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
