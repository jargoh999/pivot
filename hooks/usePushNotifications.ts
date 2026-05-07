import { useState, useEffect, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    // Check for existing subscription
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setSubscription(sub);
        }
      })
      .catch((err) => {
        console.error('Error checking push subscription:', err);
        setError(err);
      });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError(new Error('Push notifications are not supported in this browser'));
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      return permissionResult === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError(err instanceof Error ? err : new Error('Failed to request permission'));
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return null;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch('/api/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      setSubscription(subscription);
      return subscription;
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to subscribe to push notifications'));
      return null;
    }
  }, [permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to unsubscribe from push notifications'));
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
    error,
  };
};

export default usePushNotifications;
