import { NextResponse } from 'next/server';
import webPush from 'web-push';

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
    const { subscription, message } = await req.json();

    if (!subscription || !message) {
      return NextResponse.json(
        { error: 'Subscription and message are required' },
        { status: 400 }
      );
    }

    // Enhanced test notification with all features
    const enhancedMessage = {
      title: message.title || 'Test Notification',
      body: message.body || 'This is a test push notification from Vibe Chat!',
      icon: message.icon || '/logo1.png',
      badge: '/logo1.png',
      data: message.data || {
        url: '/chat',
        timestamp: Date.now(),
        test: true
      },
      // Enhanced features
      requireInteraction: message.requireInteraction !== false,
      silent: message.silent || false,
      tag: message.tag || 'test-notification',
      renotify: message.renotify !== false,
      actions: message.actions || [
        {
          action: 'like',
          title: 'Like',
          icon: '/icons/heart.svg'
        },
        {
          action: 'message',
          title: 'Message',
          icon: '/icons/message.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/close.svg'
        }
      ],
      image: message.image || null,
      vibrate: message.vibrate || [200, 100, 200],
      timestamp: message.timestamp || Date.now(),
      // Visual enhancements
      dir: message.direction || 'auto',
      lang: message.language || 'en-US',
      // Analytics
      notificationId: message.notificationId || `test_${Date.now()}`,
      userId: message.userId || 'test-user',
      trackDelivery: true,
    };

    // Send the notification
    await webPush.sendNotification(
      subscription,
      JSON.stringify(enhancedMessage)
    );

    console.log('Test notification sent:', {
      notificationId: enhancedMessage.notificationId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      notificationId: enhancedMessage.notificationId,
      message: 'Test notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending test push notification:', error);

    // Handle specific errors
    if (error instanceof webPush.WebPushError) {
      if (error.statusCode === 410) {
        return NextResponse.json(
          {
            error: 'Subscription has expired',
            code: 'SUBSCRIPTION_EXPIRED',
            details: 'Please re-subscribe to push notifications'
          },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to send test notification',
        code: 'SEND_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
