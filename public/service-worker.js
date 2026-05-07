// Service Worker for Vibe Chat

const CACHE_NAME = 'vibe-chat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo1.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Try to add all assets to cache, but don't fail if some are missing
        return Promise.all(
          ASSETS_TO_CACHE.map(asset => {
            return cache.add(asset).catch(err => {
              console.warn(`Failed to cache ${asset}:`, err);
              return null;
            });
          })
        );
      })
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'New Notification';

  // Enhanced notification options
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo1.png',
    badge: '/logo1.png',
    data: data.data || {},
    // Enhanced features
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag || 'default',
    renotify: data.renotify || true,
    actions: data.actions || [],
    image: data.image || null,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: data.timestamp || Date.now(),
    // Visual enhancements
    dir: data.direction || 'auto',
    lang: data.language || 'en-US',
  };

  // Show notification with fallback
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(notification => {
        console.log('Notification shown successfully:', notification.title);

        // Track notification delivery (optional analytics)
        if (data.trackDelivery) {
          fetch('/api/analytics/notification-delivered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId: data.notificationId,
              timestamp: Date.now(),
              userId: data.userId
            })
          }).catch(err => console.log('Analytics tracking failed:', err));
        }

        return notification;
      })
      .catch(error => {
        console.error('Error showing notification:', error);

        // Fallback notification
        return self.registration.showNotification('Vibe Chat', {
          body: 'You have a new notification',
          icon: '/logo1.png',
          badge: '/logo1.png',
          data: { fallback: true }
        });
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  // Track notification click (optional analytics)
  if (data.notificationId) {
    fetch('/api/analytics/notification-clicked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: data.notificationId,
        action: event.action,
        timestamp: Date.now(),
        userId: data.userId
      })
    }).catch(err => console.log('Analytics tracking failed:', err));
  }

  // Handle different actions
  if (event.action) {
    // Handle button actions (like, message, etc.)
    handleNotificationAction(event.action, data);
    return;
  }

  // Handle notification body click
  event.waitUntil(
    handleNotificationClick(data)
  );
});

// Handle notification actions (buttons)
async function handleNotificationAction(action, data) {
  try {
    switch (action) {
      case 'like':
        await fetch('/api/matches/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.targetUserId })
        });
        break;
      case 'message':
        await focusOrOpenClient(`/chat/${data.chatId}`);
        break;
      case 'view-profile':
        await focusOrOpenClient(`/profile/${data.targetUserId}`);
        break;
      case 'dismiss':
        // Just close the notification, no further action
        break;
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Error handling notification action:', error);
  }
}

// Handle main notification click
async function handleNotificationClick(data) {
  const urlToOpen = data.url || '/chat';

  // Try to focus existing client first
  try {
    const clientList = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Focus existing Vibe Chat client if available
    for (const client of clientList) {
      if (client.url.includes(window.location.origin) && 'focus' in client) {
        await client.focus();
        // Navigate to specific URL if different
        if (client.url !== window.location.origin + urlToOpen) {
          await client.navigate(urlToOpen);
        }
        return;
      }
    }

    // Open new window if no existing client
    if (clients.openWindow) {
      await clients.openWindow(urlToOpen);
    }
  } catch (error) {
    console.error('Error handling notification click:', error);
    // Fallback to opening new window
    if (clients.openWindow) {
      await clients.openWindow(urlToOpen);
    }
  }
}

// Helper function to focus or open client
async function focusOrOpenClient(url) {
  try {
    const clientList = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of clientList) {
      if (client.url.includes(window.location.origin) && 'focus' in client) {
        await client.focus();
        if (client.url !== window.location.origin + url) {
          await client.navigate(url);
        }
        return;
      }
    }

    if (clients.openWindow) {
      await clients.openWindow(url);
    }
  } catch (error) {
    console.error('Error focusing/opening client:', error);
  }
}

// Notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};

  // Track notification dismissal
  if (data.notificationId) {
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: data.notificationId,
        timestamp: Date.now(),
        userId: data.userId
      })
    }).catch(err => console.log('Analytics tracking failed:', err));
  }
});
