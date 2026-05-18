import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new verification code
    await User.findByIdAndUpdate(user._id, {
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
    });

    // Send verification email
    try {
      console.log('Creating Gmail transporter for resend OTP...');

      // Create Gmail transporter
      const transporter = nodemailer.createTransport({
        host: process.env.GMAIL_HOST,
        port: parseInt(process.env.GMAIL_PORT || '587'),
        secure: process.env.GMAIL_SECURE === 'true',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Verify transporter configuration
      await transporter.verify();
      console.log('Gmail transporter verified successfully');

      console.log('Sending resend OTP email to:', email);
      const info = await transporter.sendMail({
        from: `"Pivot PLC" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: 'Verify your Pivot account - New Code',
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
                <h1 class="title">New Verification Code</h1>
                <p>You requested a new verification code. Please use the code below to verify your email address.</p>
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

      console.log('Resend OTP email sent successfully:', info.messageId);
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', emailError.message || emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email: ' + (emailError.message || 'Unknown error') },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
