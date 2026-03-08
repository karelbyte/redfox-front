'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import { userLanguageService } from '@/services/user-language.service';

const LANGUAGE_STORAGE_KEY = 'nitro-language';

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);

  // Extract locale from pathname
  const getLocaleFromPath = () => {
    const pathSegments = pathname.split('/');
    const foundLocale = pathSegments.find(segment => locales.includes(segment as Locale));
    return foundLocale || defaultLocale;
  };

  // Get stored language from localStorage
  const getStoredLanguage = (): string => {
    if (typeof window === 'undefined') return defaultLocale;

    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return stored && locales.includes(stored as Locale) ? stored : defaultLocale;
    } catch (error) {
      console.warn('Error reading language from localStorage:', error);
      return defaultLocale;
    }
  };

  // Save language to localStorage
  const saveLanguage = (locale: string) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Error saving language to localStorage:', error);
    }
  };

  // Change language and save to localStorage and API
  const changeLanguage = async (newLocale: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);

    // Find all indices that contain a valid locale
    const localeIndices = pathSegments.reduce((acc, segment, index) => {
      if (locales.includes(segment as Locale)) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);

    let newSegments = [...pathSegments];

    if (localeIndices.length > 0) {
      // Replace the FIRST found locale with the new one
      const primaryLocaleIndex = localeIndices[0];
      newSegments[primaryLocaleIndex] = newLocale;

      // Remove ANY OTHER locale segments that might have been accidentally added
      // We process from right to left to avoid index shifting issues
      for (let i = localeIndices.length - 1; i > 0; i--) {
        newSegments.splice(localeIndices[i], 1);
      }
    } else {
      // If no locale found, we need to decide where to put it
      // Usually after tenant if tenant exists, or at the beginning
      // For now, let's keep it simple: if first segment is NOT a locale, 
      // it might be a tenant, so we put locale as second segment.
      if (newSegments.length > 0) {
        newSegments.splice(1, 0, newLocale);
      } else {
        newSegments.push(newLocale);
      }
    }

    const newPathname = '/' + newSegments.join('/');

    // Don't navigate if clicking on the current locale
    if (newLocale === getLocaleFromPath()) {
      return;
    }

    // Save to localStorage
    saveLanguage(newLocale);

    // Send to API (async, don't wait for it to complete)
    userLanguageService.updateUserLanguage(newLocale);

    // Navigate to the new locale
    router.push(newPathname);
  };

  // Update current locale when pathname changes
  useEffect(() => {
    setCurrentLocale(getLocaleFromPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return {
    currentLocale,
    changeLanguage,
    getStoredLanguage,
    saveLanguage
  };
} 