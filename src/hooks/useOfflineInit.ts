"use client";

import { useEffect, useRef } from 'react';
import { cacheManager } from '@/services/offline/cache-manager';
import { migrateDatabase } from '@/lib/db-migration';

/**
 * Hook para inicializar funcionalidades offline
 * - Migra la base de datos si es necesario
 * - Precarga datos cuando hay conexión
 * - Limpia datos antiguos periódicamente
 */
export function useOfflineInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        await migrateDatabase();
      } catch (error) {
        console.error('Database migration failed:', error);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (navigator.onLine) {
        
        try {
          await cacheManager.preloadProviders();
          await cacheManager.preloadClients();
        } catch (error) {
          console.error('Error preloading data:', error);
        }

        try {
          await cacheManager.cleanOldData();
        } catch (error) {
          console.error('Error cleaning old data:', error);
        }
      }
    };

    init();

    const cleanupInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await cacheManager.cleanOldData();
          console.log('🧹 Periodic cleanup completed');
        } catch (error) {
          console.error('Error in periodic cleanup:', error);
        }
      }
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);
}
