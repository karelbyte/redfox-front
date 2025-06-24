'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

const LANGUAGE_STORAGE_KEY = 'nitro-language';

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);

  // Extract locale from pathname
  const getLocaleFromPath = () => {
    const pathSegments = pathname.split('/');
    return pathSegments[1] || defaultLocale;
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

  // Change language and save to localStorage
  const changeLanguage = (newLocale: string) => {
    const currentPathLocale = getLocaleFromPath();
    
    // Don't navigate if clicking on the current locale
    if (newLocale === currentPathLocale) {
      return;
    }

    // Save to localStorage
    saveLanguage(newLocale);

    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${currentPathLocale}`, '') || '/';
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
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