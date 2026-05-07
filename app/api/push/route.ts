import { NextResponse } from 'next/server';
import webPush from 'web-push';

// You should generate these keys and store them in environment variables
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  throw new Error('VAPID keys are not defined in environment variables');
}

webPush.setVapidDetails(
  'mailto:notifications@vibechat.app',
  publicVapidKey,
  privateVapidKey
);

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    // In a real app, you would save this subscription to a database
    // For now, we'll just return a success response

    // Example of sending a welcome notification
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Welcome!',
        body: 'Thank you for enabling push notifications!',
        icon: '/logo1.png',
        data: {
          url: '/'  // Using root path as default
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to handle push subscription' },
      { status: 500 }
    );
  }
}
