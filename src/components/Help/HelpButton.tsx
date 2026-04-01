'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SupportModal from '@/components/Support/SupportModal';

export interface HelpSection {
  icon?: string;
  title: { es: string; en: string };
  content: { es: string; en: string };
}

export interface HelpConfig {
  title: { es: string; en: string };
  description: { es: string; en: string };
  sections: HelpSection[];
}

interface HelpButtonProps {
  config: HelpConfig;
}

export default function HelpButton({ config }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const locale = useLocale();
  const tHelp = useTranslations('help');

  const lang = locale === 'en' ? 'en' : 'es';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-gray-50"
        style={{
          color: `rgb(var(--color-primary-600))`,
          borderColor: `rgb(var(--color-primary-200))`,
        }}
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
        <span>{tHelp('button')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: `rgb(var(--color-primary-100))` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `rgb(var(--color-primary-50))` }}
                >
                  <QuestionMarkCircleIcon
                    className="h-5 w-5"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  />
                </div>
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: `rgb(var(--color-primary-800))` }}
                  >
                    {config.title[lang]}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{config.description[lang]}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {config.sections.map((section, i) => (
                <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
                  <div
                    className="flex items-center gap-2 px-4 py-3"
                    style={{ backgroundColor: `rgb(var(--color-primary-50))` }}
                  >
                    {section.icon && <span className="text-base">{section.icon}</span>}
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: `rgb(var(--color-primary-700))` }}
                    >
                      {section.title[lang]}
                    </h3>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.content[lang]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer — abre modal de soporte */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setIsOpen(false); setSupportOpen(true); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center underline underline-offset-2"
              >
                {tHelp('footer')}
              </button>
            </div>
          </div>
        </div>
      )}

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
