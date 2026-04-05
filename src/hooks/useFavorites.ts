'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nitro-favorites';

export interface FavoriteItem {
  path: string;
  name: string;
}

function readFromStorage(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: FavoriteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Disparar evento para sincronizar otras instancias del hook en la misma pestaña
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(items) }));
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(readFromStorage());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isFavorite = useCallback(
    (path: string) => favorites.some((f) => f.path === path),
    [favorites],
  );

  const toggle = useCallback(
    (item: FavoriteItem) => {
      const current = readFromStorage();
      const exists = current.some((f) => f.path === item.path);
      const next = exists ? current.filter((f) => f.path !== item.path) : [...current, item];
      writeToStorage(next);
      setFavorites(next);
    },
    [],
  );

  return { favorites, isFavorite, toggle };
}
