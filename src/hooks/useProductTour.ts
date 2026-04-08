'use client';

import { useState, useCallback } from 'react';

export const TOUR_KEY = 'nitro-product-tour-completed';

export function useProductTour() {
  const [active, setActive] = useState(false);

  const startTour = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY)) return;
    setTimeout(() => setActive(true), 400);
  }, []);

  const resetAndStart = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOUR_KEY);
    setTimeout(() => setActive(true), 100);
  }, []);

  const stopTour = useCallback(() => {
    setActive(false);
  }, []);

  return { active, startTour, resetAndStart, stopTour };
}
