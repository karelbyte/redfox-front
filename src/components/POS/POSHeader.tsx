'use client'

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';

interface POSHeaderProps {
  total: number;
}

export default function POSHeader({ total }: POSHeaderProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.pos');

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Btn
              variant="ghost"
              onClick={() => router.push(`/${locale}/dashboard`)}
              leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              {t('backToDashboard')}
            </Btn>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
                {t('title')}
              </h1>
              <p className="text-sm text-gray-500">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{t('total')}:</span>
            <span className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-600))` }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 