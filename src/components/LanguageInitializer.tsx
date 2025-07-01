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
      
      if (storedLanguage && locales.includes(storedLanguage as Locale)) {
        // Extract current locale from pathname
        const pathSegments = pathname.split('/');
        const currentLocale = pathSegments[1];
        
        // If the stored language is different from the current path locale
        if (currentLocale !== storedLanguage) {
          // Remove the current locale from the pathname
          const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
          
          // Navigate to the stored language
          router.replace(`/${storedLanguage}${pathWithoutLocale}`);
        }
      }
    } catch (error) {
      console.warn('Error initializing language from localStorage:', error);
    }
  }, [pathname, router, isClient]);

  // This component doesn't render anything
  return null;
} 