'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { BellRing, MessageSquareHeart, Heart, Eye } from 'lucide-react';
import { testPushNotification } from '@/lib/notifications';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { toast } from 'sonner';
import usePushNotifications from '@/hooks/usePushNotifications';

type NotificationType = 'test' | 'message' | 'match' | 'like' | 'profile_view';

export default function TestNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { isSubscribed } = usePushNotifications();

  const handleTestNotification = async (type: NotificationType = 'test') => {
    if (!isSubscribed) {
      toast.error('Please enable push notifications first');
      return;
    }

    setIsLoading(true);
    try {
      // First ensure service worker is registered
      const isRegistered = await registerServiceWorker();

      if (!isRegistered) {
        toast.error('Failed to register service worker. Notifications may not work.');
        return;
      }

      // Customize notification based on type
      switch (type) {
        case 'message':
          await testMessageNotification();
          break;
        case 'match':
          await testMatchNotification();
          break;
        case 'like':
          await testLikeNotification();
          break;
        case 'profile_view':
          await testProfileViewNotification();
          break;
        default:
          await testPushNotification();
      }

      toast.success(`${type === 'test' ? 'Test' : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} notification sent!`);
    } catch (error) {
      console.error('Error testing notification:', error);
      toast.error('Failed to show test notification. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const testMessageNotification = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return;

    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        message: {
          title: 'New message from Sarah',
          body: 'Hey! Are you free for coffee tomorrow?',
          icon: '/logo1.png',
          tag: 'chat-123',
          requireInteraction: false,
          actions: [
            { action: 'message', title: 'Reply', icon: '/icons/message.svg' },
            { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.svg' }
          ],
          data: { url: '/chat/123', chatId: '123', targetUserId: 'user456' }
        }
      })
    });
  };

  const testMatchNotification = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return;

    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        message: {
          title: 'You have a new match!',
          body: 'You and Emma liked each other',
          icon: '/logo1.png',
          tag: 'match-789',
          requireInteraction: true,
          actions: [
            { action: 'message', title: 'Message', icon: '/icons/message.svg' },
            { action: 'view-profile', title: 'View Profile', icon: '/icons/profile.svg' }
          ],
          data: { url: '/chat/789', targetUserId: 'user789' }
        }
      })
    });
  };

  const testLikeNotification = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return;

    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        message: {
          title: 'Someone likes you!',
          body: 'Michael liked your profile',
          icon: '/logo1.png',
          tag: 'like-456',
          requireInteraction: false,
          actions: [
            { action: 'like', title: 'Like Back', icon: '/icons/heart.svg' },
            { action: 'view-profile', title: 'View Profile', icon: '/icons/profile.svg' }
          ],
          data: { url: '/discover', targetUserId: 'user456' }
        }
      })
    });
  };

  const testProfileViewNotification = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return;

    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        message: {
          title: 'Profile viewed',
          body: 'Jessica viewed your profile',
          icon: '/logo1.png',
          tag: 'view-321',
          requireInteraction: false,
          silent: true,
          data: { url: '/discover', targetUserId: 'user321' }
        }
      })
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => handleTestNotification('test')}
        variant="outline"
        disabled={isLoading || !isSubscribed}
        className="flex items-center gap-2"
      >
        <BellRing className="h-4 w-4" />
        Test Notification
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleTestNotification('message')}
          variant="outline"
          size="sm"
          disabled={isLoading || !isSubscribed}
          className="flex items-center gap-1"
        >
          <MessageSquareHeart className="h-3 w-3" />
          Message
        </Button>

        <Button
          onClick={() => handleTestNotification('match')}
          variant="outline"
          size="sm"
          disabled={isLoading || !isSubscribed}
          className="flex items-center gap-1"
        >
          <Heart className="h-3 w-3" />
          Match
        </Button>

        <Button
          onClick={() => handleTestNotification('like')}
          variant="outline"
          size="sm"
          disabled={isLoading || !isSubscribed}
          className="flex items-center gap-1"
        >
          <Heart className="h-3 w-3" />
          Like
        </Button>

        <Button
          onClick={() => handleTestNotification('profile_view')}
          variant="outline"
          size="sm"
          disabled={isLoading || !isSubscribed}
          className="flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
      </div>
    </div>
  );
}
