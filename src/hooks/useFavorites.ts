'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nitro-favorites';

export interface FavoriteItem {
  path: string;       // path base sin tenant/locale, ej: /dashboard/clientes
  name: string;
  translationKey?: string;
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
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(items) }));
  } catch {
    // ignore
  }
}

/**
 * Extrae el path base quitando el prefijo /{tenant}/{locale}
 * Ej: /redfox/es/dashboard/clientes → /dashboard/clientes
 */
export function toBasePath(path: string): string {
  // Quitar prefijo /{tenant}/{locale} si existe
  const match = path.match(/^\/[^/]+\/(?:es|en|zh)(\/.*)?$/);
  if (match) return match[1] || '/';
  return path;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    // Migrar favoritos viejos que tengan paths con tenant/locale
    const stored = readFromStorage();
    const migrated = stored.map(f => ({ ...f, path: toBasePath(f.path) }));
    // Deduplicar por path
    const deduped = migrated.filter((f, i, arr) => arr.findIndex(x => x.path === f.path) === i);
    if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
      writeToStorage(deduped);
    }
    setFavorites(deduped);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isFavorite = useCallback(
    (path: string) => {
      const base = toBasePath(path);
      return favorites.some((f) => f.path === base);
    },
    [favorites],
  );

  const toggle = useCallback(
    (item: FavoriteItem) => {
      const base = toBasePath(item.path);
      const normalizedItem = { ...item, path: base };
      const current = readFromStorage();
      const exists = current.some((f) => f.path === base);
      const next = exists
        ? current.filter((f) => f.path !== base)
        : [...current, normalizedItem];
      writeToStorage(next);
      setFavorites(next);
    },
    [],
  );

  return { favorites, isFavorite, toggle };
}
