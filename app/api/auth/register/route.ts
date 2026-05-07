import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  console.log('Register API called');

  try {
    const body = await req.json();
    console.log('Request body received:', { ...body, password: '***' });

    const { email, password, fullName } = body;

    // Validate input
    if (!email || !password || !fullName) {
      console.log('Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Check if user already exists
    console.log('Checking for existing user:', email.toLowerCase());
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    console.log('User does not exist, proceeding with registration');

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password before creating user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName.trim(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
    });

    // Send verification email
    try {
      console.log('Creating Gmail transporter...');
      console.log('Gmail config:', {
        host: process.env.GMAIL_HOST,
        port: process.env.GMAIL_PORT,
        secure: process.env.GMAIL_SECURE,
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD ? '***' : 'MISSING'
      });

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

      console.log('Sending email to:', email);
      const info = await transporter.sendMail({
        from: process.env.GMAIL_EMAIL!,
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
              .logo img { max-width: 120px; height: auto; }
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
                <h1 class="title">Welcome to Pivot!</h1>
                <p>Thank you for joining our community. Please verify your email address to complete your registration.</p>
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

      console.log('Email sent successfully:', info.messageId);
      console.log('Email response:', info);
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', emailError.message || emailError);

      // Check if it's an API key issue
      if (emailError.message?.includes('invalid_api_key')) {
        return NextResponse.json(
          { error: 'Email service configuration error. Please check API key.' },
          { status: 500 }
        );
      }

      // Check if it's a domain issue
      if (emailError.message?.includes('domain')) {
        return NextResponse.json(
          { error: 'Email domain not verified. Please use onboarding@resend.dev for testing.' },
          { status: 500 }
        );
      }

      // Log the error but continue with registration
      console.log('Email failed but continuing registration');
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
    };

    return NextResponse.json({
      message: 'Registration successful. Please check your email for verification code.',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
