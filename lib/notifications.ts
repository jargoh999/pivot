import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  data?: any;
  icon?: string;
  badge?: string;
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
  // Enhanced options
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  image?: string;
  direction?: 'auto' | 'ltr' | 'rtl';
  language?: string;
  // Analytics
  notificationId?: string;
  userId?: string;
  trackDelivery?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushNotificationData extends NotificationOptions {
  url?: string;
  targetUserId?: string;
  chatId?: string;
  type?: 'message' | 'match' | 'like' | 'profile_view' | 'system';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function showLocalNotification(options: NotificationOptions) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission !== 'granted') {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }
  }

  const { title, ...rest } = options;
  const notification = new Notification(title, rest);

  notification.onclick = (event) => {
    event.preventDefault();
    if (options.data?.url) {
      window.focus();
      window.open(options.data.url, '_blank');
    }
  };

  return notification;
}

export function showToastNotification(options: {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}) {
  const { title, description, type = 'info', duration = 5000 } = options;

  const toastOptions = {
    duration,
  };

  switch (type) {
    case 'success':
      toast.success(title, { ...toastOptions, description });
      break;
    case 'error':
      toast.error(title, { ...toastOptions, description });
      break;
    case 'warning':
      toast.warning(title, { ...toastOptions, description });
      break;
    default:
      toast.info(title, { ...toastOptions, description });
  }
}

// Enhanced push notification functions
export async function sendPushNotification(
  subscription: PushSubscription,
  data: PushNotificationData
) {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        data: {
          ...data,
          timestamp: Date.now(),
          notificationId: generateNotificationId(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send push notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

// Specific notification types for Vibe Chat
export async function sendNewMessageNotification(
  subscription: PushSubscription,
  senderName: string,
  message: string,
  chatId: string,
  senderId: string
) {
  return sendPushNotification(subscription, {
    title: `New message from ${senderName}`,
    body: message.length > 50 ? message.substring(0, 47) + '...' : message,
    icon: '/logo1.png',
    badge: '/logo1.png',
    tag: `chat-${chatId}`,
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'message',
        title: 'Reply',
        icon: '/icons/message.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.svg'
      }
    ],
    url: `/chat/${chatId}`,
    chatId,
    targetUserId: senderId,
    type: 'message',
    userId: senderId,
  });
}

export async function sendNewMatchNotification(
  subscription: PushSubscription,
  matchName: string,
  matchId: string
) {
  return sendPushNotification(subscription, {
    title: 'You have a new match!',
    body: `You and ${matchName} liked each other`,
    icon: '/logo1.png',
    badge: '/logo1.png',
    tag: `match-${matchId}`,
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'message',
        title: 'Message',
        icon: '/icons/message.svg'
      },
      {
        action: 'view-profile',
        title: 'View Profile',
        icon: '/icons/profile.svg'
      }
    ],
    url: `/chat/${matchId}`,
    targetUserId: matchId,
    type: 'match',
    userId: matchId,
  });
}

export async function sendLikeNotification(
  subscription: PushSubscription,
  likerName: string,
  likerId: string
) {
  return sendPushNotification(subscription, {
    title: 'Someone likes you!',
    body: `${likerName} liked your profile`,
    icon: '/logo1.png',
    badge: '/logo1.png',
    tag: `like-${likerId}`,
    renotify: false,
    requireInteraction: false,
    actions: [
      {
        action: 'like',
        title: 'Like Back',
        icon: '/icons/heart.svg'
      },
      {
        action: 'view-profile',
        title: 'View Profile',
        icon: '/icons/profile.svg'
      }
    ],
    url: `/discover`,
    targetUserId: likerId,
    type: 'like',
    userId: likerId,
  });
}

export async function sendProfileViewNotification(
  subscription: PushSubscription,
  viewerName: string,
  viewerId: string
) {
  return sendPushNotification(subscription, {
    title: 'Profile viewed',
    body: `${viewerName} viewed your profile`,
    icon: '/logo1.png',
    badge: '/logo1.png',
    tag: `view-${viewerId}`,
    renotify: false,
    requireInteraction: false,
    silent: true,
    url: `/discover`,
    targetUserId: viewerId,
    type: 'profile_view',
    userId: viewerId,
  });
}

// Helper function to send push notifications from the client (for demo purposes)
// In a real app, this would be done on the server
export async function testPushNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    showToastNotification({
      title: 'Push Notifications Not Supported',
      description: 'Your browser does not support push notifications.',
      type: 'error',
    });
    return;
  }

  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Request notification permission if not already granted
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission was not granted');
      }
    }

    // Show a local notification
    await showLocalNotification({
      title: 'Test Notification',
      body: 'This is a test notification from Vibe Chat!',
      icon: '/logo1.png',
      badge: '/logo1.png',
      requireInteraction: true,
      actions: [
        { action: 'like', title: 'Like', icon: '/icons/heart.svg' },
        { action: 'message', title: 'Message', icon: '/icons/message.svg' }
      ],
      data: {
        url: window.location.href,
        timestamp: Date.now(),
        notificationId: generateNotificationId(),
      },
    });

    // Then try to show a push notification through the service worker
    try {
      await registration.pushManager.getSubscription().then(async (subscription) => {
        if (subscription) {
          // If we have a subscription, send a test notification through the push service
          await fetch('/api/push/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription,
              message: {
                title: 'Push Test',
                body: 'This is a test push notification!',
                icon: '/logo1.png',
                badge: '/logo1.png',
                requireInteraction: true,
                actions: [
                  { action: 'like', title: 'Like', icon: '/icons/heart.svg' },
                  { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.svg' }
                ],
                data: {
                  url: window.location.href,
                  timestamp: Date.now(),
                  notificationId: generateNotificationId(),
                },
              },
            }),
          });
        }
      });
    } catch (error) {
      console.log('Error sending test push notification:', error);
    }
  } catch (error) {
    console.error('Error showing test notification:', error);
    showToastNotification({
      title: 'Failed to show notification',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
      type: 'error',
    });
  }
}

// Utility functions
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Notification preferences management
export interface NotificationPreferences {
  messages: boolean;
  matches: boolean;
  likes: boolean;
  profileViews: boolean;
  system: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export const defaultNotificationPreferences: NotificationPreferences = {
  messages: true,
  matches: true,
  likes: true,
  profileViews: false,
  system: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

export function getNotificationPreferences(): NotificationPreferences {
  const stored = localStorage.getItem('notificationPreferences');
  return stored ? { ...defaultNotificationPreferences, ...JSON.parse(stored) } : defaultNotificationPreferences;
}

export function setNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
  const current = getNotificationPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem('notificationPreferences', JSON.stringify(updated));
}

export function shouldSendNotification(type: NotificationPreferences[keyof NotificationPreferences]): boolean {
  if (typeof type !== 'boolean') return true;

  const preferences = getNotificationPreferences();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Check quiet hours
  if (preferences.quietHours.enabled) {
    const { start, end } = preferences.quietHours;
    if (isTimeInRange(currentTime, start, end)) {
      return false;
    }
  }

  return type;
}

function isTimeInRange(current: string, start: string, end: string): boolean {
  const currentMinutes = timeToMinutes(current);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes <= endMinutes) {
    // Same day range (e.g., 22:00 to 08:00 is false, but 08:00 to 22:00 is true)
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight range (e.g., 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
