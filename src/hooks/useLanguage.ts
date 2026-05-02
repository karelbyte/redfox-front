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

  const getLocaleFromPath = () => {
    const pathSegments = pathname.split('/');
    const foundLocale = pathSegments.find(segment => locales.includes(segment as Locale));
    return foundLocale || defaultLocale;
  };

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

  const saveLanguage = (locale: string) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Error saving language to localStorage:', error);
    }
  };

  const changeLanguage = async (newLocale: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);

    const localeIndices = pathSegments.reduce((acc, segment, index) => {
      if (locales.includes(segment as Locale)) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);

    let newSegments = [...pathSegments];

    if (localeIndices.length > 0) {
      const primaryLocaleIndex = localeIndices[0];
      newSegments[primaryLocaleIndex] = newLocale;

      for (let i = localeIndices.length - 1; i > 0; i--) {
        newSegments.splice(localeIndices[i], 1);
      }
    } else {
      if (newSegments.length > 0) {
        newSegments.splice(1, 0, newLocale);
      } else {
        newSegments.push(newLocale);
      }
    }

    const newPathname = '/' + newSegments.join('/');

    if (newLocale === getLocaleFromPath()) {
      return;
    }

    saveLanguage(newLocale);

    userLanguageService.updateUserLanguage(newLocale);

    router.push(newPathname);
  };

  useEffect(() => {
    setCurrentLocale(getLocaleFromPath());
  }, [pathname]);

  return {
    currentLocale,
    changeLanguage,
    getStoredLanguage,
    saveLanguage
  };
} 