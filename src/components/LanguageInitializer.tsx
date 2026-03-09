'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

const LANGUAGE_STORAGE_KEY = 'nitro-language';

export function LanguageInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof window === 'undefined') return;

    try {
      // Get stored language
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const searchParams = window.location.search;

      if (storedLanguage && locales.includes(storedLanguage as Locale)) {
        // Extract current locale from pathname
        const pathSegments = pathname.split('/').filter(Boolean);
        const localeIndices = pathSegments.reduce((acc, segment, index) => {
          if (locales.includes(segment as Locale)) {
            acc.push(index);
          }
          return acc;
        }, [] as number[]);

        const currentLocale = localeIndices.length > 0 ? pathSegments[localeIndices[0]] : null;

        // If the stored language is different from the current path locale
        if (currentLocale && currentLocale !== storedLanguage) {
          // Replace the FIRST found locale and remove others
          let newSegments = [...pathSegments];
          newSegments[localeIndices[0]] = storedLanguage;

          for (let i = localeIndices.length - 1; i > 0; i--) {
            newSegments.splice(localeIndices[i], 1);
          }

          const newPathname = '/' + newSegments.join('/') + searchParams;
          console.log('[LanguageInitializer] Redirecting to change locale:', newPathname);
          router.replace(newPathname);
        } else if (localeIndices.length > 1) {
          // If the locale is correct but there are duplicates, clean them up
          let newSegments = [...pathSegments];
          for (let i = localeIndices.length - 1; i > 0; i--) {
            newSegments.splice(localeIndices[i], 1);
          }
          const newPathname = '/' + newSegments.join('/') + searchParams;
          console.log('[LanguageInitializer] Cleaning up duplicate locales:', newPathname);
          router.replace(newPathname);
        }
      }
    } catch (error) {
      console.warn('Error initializing language from localStorage:', error);
    }
  }, [pathname, router, isClient]);

  // This component doesn't render anything
  return null;
}