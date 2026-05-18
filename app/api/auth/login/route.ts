import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
        const transporter = nodemailer.createTransport({
          host: process.env.GMAIL_HOST,
          port: parseInt(process.env.GMAIL_PORT || '587'),
          secure: process.env.GMAIL_SECURE === 'true',
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"Pivot PLC" <${process.env.GMAIL_EMAIL}>`,
          to: email,
          subject: 'Verify your Pivot account',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Pivot Account</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8f9fa; border-radius: 12px; }
                .logo { text-align: center; margin-bottom: 30px; }
                .header { text-align: center; margin-bottom: 30px; }
                .title { color: #e83f55; font-size: 28px; font-weight: bold; margin: 0; }
                .code-box { background: #e83f55; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
                .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .footer a { color: #e83f55; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">
                  <img src="https://res.cloudinary.com/dbjtncfmz/image/upload/v1778149482/logo1_fm2jox.png" alt="Pivot Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
                  <h2 style="color: #e83f55; margin: 0; font-size: 24px;">Pivot</h2>
                </div>
                <div class="header">
                  <h1 class="title">Verify Your Email</h1>
                  <p>Please use the verification code below to complete your login:</p>
                </div>
                <div class="code-box">
                  <p style="margin: 0 0 15px 0; font-size: 16px;">Your verification code is:</p>
                  <div class="code">${verificationCode}</div>
                  <p style="margin: 15px 0 0 0; font-size: 14px;">This code will expire in 10 minutes.</p>
                </div>
                <div class="footer">
                  <p>Cannot find the email? Check your spam folder or <a href="mailto:support@pivot.app">contact support</a></p>
                  <p>© 2026 Pivot. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
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
      fullName: user.fullName,
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
