import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    console.log('Testing email send to:', email);

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Test Email from Vibe Chat',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e83f55; margin: 0;">Vibe Chat Email Test</h1>
            <p style="color: #333;">This is a test email to verify your email service is working.</p>
            <p style="color: #666; font-size: 14px;">If you received this, your email configuration is correct!</p>
          </div>
        </div>
      `,
    });

    console.log('Email send result:', result);

    return NextResponse.json({ 
      message: 'Test email sent successfully',
      result: result 
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}
