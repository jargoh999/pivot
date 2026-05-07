// Service Worker for handling push notifications
self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data?.json();
  const title = data?.title || 'New Notification';
  const options = {
    body: data?.body || 'You have a new notification',
    icon: '/logo1.png',
    badge: '/logo1.png',
    data: data?.data || {},
    ...data?.options
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
event.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Handle the notification click
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
