'use client';

import { useState } from 'react';
import { locales } from '@/i18n/config';
import { Btn } from '@/components/atoms';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLocale, changeLanguage } = useLanguage();
  
  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(newLocale);
    setIsOpen(false);
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
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{languageNames[currentLocale as keyof typeof languageNames]}</span>
      </Btn>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  currentLocale === loc ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                {languageNames[loc as keyof typeof languageNames]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 