'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

// This component handles the registration of the service worker
const ServiceWorkerRegistration = () => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported in this browser');
        return;
      }

      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        console.log('Service Worker registered with scope:', registration.scope);

        // Check for updates
        if (registration.waiting) {
          console.log('Service worker update available');
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                console.log('New service worker installed');
              }
            });
          }
        });

        return () => {
          // Cleanup if needed
        };
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        toast.error('Failed to register service worker. Notifications may not work.');
      }
    };

    // Register service worker on component mount
    // Allow registration in development for testing
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
