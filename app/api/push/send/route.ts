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
        const { subscription, data } = await req.json();

        if (!subscription || !data) {
            return NextResponse.json(
                { error: 'Subscription and data are required' },
                { status: 400 }
            );
        }

        // Enhanced notification payload
        const payload = JSON.stringify({
            title: data.title || 'Vibe Chat',
            body: data.body || '',
            icon: data.icon || '/logo1.png',
            badge: '/logo1.png',
            data: data.data || {},
            // Enhanced features
            requireInteraction: data.requireInteraction || false,
            silent: data.silent || false,
            tag: data.tag || 'vibechat',
            renotify: data.renotify !== false,
            actions: data.actions || [],
            image: data.image || null,
            vibrate: data.vibrate || [200, 100, 200],
            timestamp: data.timestamp || Date.now(),
            // Visual enhancements
            dir: data.direction || 'auto',
            lang: data.language || 'en-US',
            // Analytics
            notificationId: data.notificationId,
            userId: data.userId,
            trackDelivery: data.trackDelivery || false,
        });

        // Send push notification
        const result = await webPush.sendNotification(subscription, payload);

        // Log successful delivery (for debugging/analytics)
        console.log('Push notification sent successfully:', {
            notificationId: data.notificationId,
            userId: data.userId,
            type: data.type,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            notificationId: data.notificationId,
            result
        });

    } catch (error) {
        console.error('Error sending push notification:', error);

        // Handle specific push notification errors
        if (error instanceof webPush.WebPushError) {
            if (error.statusCode === 410) {
                // Subscription has expired or been revoked
                return NextResponse.json(
                    {
                        error: 'Subscription expired',
                        code: 'SUBSCRIPTION_EXPIRED',
                        details: error.message
                    },
                    { status: 410 }
                );
            } else if (error.statusCode === 429) {
                // Rate limited
                return NextResponse.json(
                    {
                        error: 'Rate limited',
                        code: 'RATE_LIMITED',
                        details: error.message
                    },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to send push notification',
                code: 'SEND_FAILED',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
