"use client";

import { useState, useEffect } from 'react';
import { syncManager } from '@/services/offline/sync-manager';

export function useOffline() {
  // Inicializar desde localStorage si existe
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app_online_status');
      return stored ? stored === 'true' : navigator.onLine;
    }
    return true;
  });
  
  const [wasOffline, setWasOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_was_offline') === 'true';
    }
    return false;
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Actualizar estado inicial real
    const actualOnlineStatus = navigator.onLine;
    setIsOnline(actualOnlineStatus);
    localStorage.setItem('app_online_status', String(actualOnlineStatus));

    // Check pending operations count
    const updatePendingCount = async () => {
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    };
    updatePendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      localStorage.setItem('app_online_status', 'true');
      
      if (wasOffline) {
        // Trigger sync when coming back online
        console.log('🔄 Back online, starting sync...');
        setIsSyncing(true);
        
        try {
          await syncManager.processPendingOperations();
          await updatePendingCount();
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
        
        setWasOffline(false);
        localStorage.setItem('app_was_offline', 'false');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      localStorage.setItem('app_online_status', 'false');
      localStorage.setItem('app_was_offline', 'true');
    };

    // Listen to sync status changes
    const unsubscribe = syncManager.onSyncStatusChange((status) => {
      setIsSyncing(status === 'syncing');
      if (status === 'idle') {
        updatePendingCount();
      }
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
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

  const manualSync = async () => {
    if (!isOnline) {
      console.log('Cannot sync: offline');
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncManager.processPendingOperations();
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    isSyncing,
    pendingCount,
    queueOfflineAction,
    manualSync,
  };
}