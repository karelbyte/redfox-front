"use client";

import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        if ('serviceWorker' in navigator) {
          const swReg = window.ServiceWorkerRegistration as any;
          if ('sync' in swReg.prototype) {
            navigator.serviceWorker.ready.then((registration: any) => {
              return registration.sync.register('background-sync');
            });
          }
        }
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const queueOfflineAction = async (action: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  }) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('nitro-v1');
        const existingActions = await cache.match('/offline-actions');
        let actions = [];

        if (existingActions) {
          actions = await existingActions.json();
        }

        actions.push({
          ...action,
          timestamp: Date.now(),
        });

        await cache.put('/offline-actions', new Response(JSON.stringify(actions)));
      } catch (error) {
        console.error('Failed to queue offline action:', error);
      }
    }
  };

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    queueOfflineAction,
  };
}