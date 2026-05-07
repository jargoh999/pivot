'use client';

import { Button } from './ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import usePushNotifications from '@/hooks/usePushNotifications';

export default function NotificationToggle() {
  const {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    permission,
    error,
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');

  useEffect(() => {
    if (error) {
      console.error('Push notification error:', error);
      setShowTooltip(error.message);
      const timer = setTimeout(() => setShowTooltip(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      setShowTooltip('Push notifications are not supported in your browser');
      return;
    }

    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        setShowTooltip('Notifications disabled');
      } else {
        await subscribe();
        setShowTooltip('Notifications enabled!');
      }
    } catch (err) {
      console.error('Error toggling notifications:', err);
      setShowTooltip('Failed to update notification settings');
    } finally {
      setIsLoading(false);
      const timer = setTimeout(() => setShowTooltip(''), 3000);
      return () => clearTimeout(timer);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleNotifications}
        disabled={isLoading || permission === 'denied'}
        aria-label={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
        className="relative"
      >
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-yellow-500" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          {showTooltip}
        </div>
      )}
    </div>
  );
}
