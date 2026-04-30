'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

const LANGUAGE_STORAGE_KEY = 'nitro-language';

function mapBrowserLanguageToLocale(browserLanguage: string): string | null {
  const languageMap: Record<string, string> = {
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-419': 'es',
    'zh': 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
  };

  const normalizedLang = browserLanguage.toLowerCase().trim();
  return languageMap[normalizedLang] || languageMap[browserLanguage] || null;
}

export function LanguageInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    try {
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const searchParams = window.location.search;

      if (!storedLanguage) {
        const browserLanguage = navigator.language || 'es';
        const mappedLanguage = mapBrowserLanguageToLocale(browserLanguage);
        
        if (mappedLanguage && locales.includes(mappedLanguage as any)) {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, mappedLanguage);
          
          const pathSegments = pathname.split('/').filter(Boolean);
          const localeIndices = pathSegments.reduce((acc, segment, index) => {
            if (locales.includes(segment as any)) {
              acc.push(index);
            }
            return acc;
          }, [] as number[]);

          if (localeIndices.length === 0) {
            const newPathname = '/' + pathSegments.join('/') + `/${mappedLanguage}` + searchParams;
            console.log('[LanguageInitializer] Redirecting to detected language:', newPathname);
            router.replace(newPathname);
            return;
          }
        }
      }

      if (storedLanguage && locales.includes(storedLanguage as Locale)) {
        const pathSegments = pathname.split('/').filter(Boolean);
        const localeIndices = pathSegments.reduce((acc, segment, index) => {
          if (locales.includes(segment as Locale)) {
            acc.push(index);
          }
          return acc;
        }, [] as number[]);

        const currentLocale = localeIndices.length > 0 ? pathSegments[localeIndices[0]] : null;

        if (currentLocale && currentLocale !== storedLanguage) {
          let newSegments = [...pathSegments];
          newSegments[localeIndices[0]] = storedLanguage;

          for (let i = localeIndices.length - 1; i > 0; i--) {
            newSegments.splice(localeIndices[i], 1);
          }

          const newPathname = '/' + newSegments.join('/') + searchParams;
          console.log('[LanguageInitializer] Redirecting to change locale:', newPathname);
          router.replace(newPathname);
        } else if (localeIndices.length > 1) {
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

  return null;
}