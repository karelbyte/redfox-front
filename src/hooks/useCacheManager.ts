"use client";

import { useState, useEffect } from 'react';
import { cacheManager } from '@/services/offline/cache-manager';

export function useCacheManager() {
  const [stats, setStats] = useState({
    providersCount: 0,
    clientsCount: 0,
    pendingOperationsCount: 0,
    lastSync: null as number | null,
    cacheSize: '0 KB'
  });
  const [health, setHealth] = useState({
    isHealthy: true,
    issues: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = async () => {
    const newStats = await cacheManager.getCacheStats();
    setStats(newStats);
  };

  const checkHealth = async () => {
    const newHealth = await cacheManager.checkCacheHealth();
    setHealth(newHealth);
  };

  const preloadData = async () => {
    setIsLoading(true);
    try {
      await cacheManager.preloadProviders();
      await cacheManager.preloadClients();
      await refreshStats();
    } finally {
      setIsLoading(false);
    }
  };

  const cleanOldData = async () => {
    setIsLoading(true);
    try {
      await cacheManager.cleanOldData();
      await refreshStats();
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      await cacheManager.clearAllCache();
      await refreshStats();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    checkHealth();

    // Actualizar stats cada 30 segundos
    const interval = setInterval(() => {
      refreshStats();
      checkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    health,
    isLoading,
    preloadData,
    cleanOldData,
    clearCache,
    refreshStats,
    checkHealth
  };
}
