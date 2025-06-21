'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';
import { Btn } from '@/components/atoms';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const languageNames = {
    es: 'Español',
    en: 'English'
  };

  return (
    <div className="relative">
      <Btn
        variant="ghost"
        size="sm"
        leftIcon={<GlobeAltIcon className="h-4 w-4" />}
        className="flex items-center space-x-1"
      >
        <span>{languageNames[locale as keyof typeof languageNames]}</span>
      </Btn>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
        <div className="py-1">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === loc ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
              }`}
            >
              {languageNames[loc as keyof typeof languageNames]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 