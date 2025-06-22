'use client';

import { useTranslations } from 'next-intl';
import { locales } from '@/i18n/config';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSelectorCompact() {
  const t = useTranslations('common.languages');
  const { currentLocale, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(newLocale);
  };

  return (
    <div className="space-y-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            currentLocale === loc 
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