'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';

export function LanguageSelectorCompact() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common.languages');

  // Get the current locale from the URL pathname
  const getCurrentLocaleFromPath = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments[0] && locales.includes(pathSegments[0] as typeof locales[number]) 
      ? pathSegments[0] 
      : locale;
  };

  const currentLocaleFromPath = getCurrentLocaleFromPath();

  const handleLanguageChange = (newLocale: string) => {
    // Don't navigate if clicking on the current locale
    if (newLocale === currentLocaleFromPath) {
      return;
    }

    // Get the path segments and remove the current locale
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // If the first segment is the current locale, remove it
    const pathWithoutLocale = pathSegments[0] === currentLocaleFromPath 
      ? pathSegments.slice(1) 
      : pathSegments;
    
    // Build the new path with the new locale
    const newPath = pathWithoutLocale.length > 0 
      ? `/${newLocale}/${pathWithoutLocale.join('/')}` 
      : `/${newLocale}`;
    
    
    // Navigate to the new locale
    router.push(newPath);
  };

  return (
    <div className="space-y-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            currentLocaleFromPath === loc 
              ? 'bg-primary-100 text-primary-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
} 