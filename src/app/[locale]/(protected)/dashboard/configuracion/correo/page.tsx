'use client'

import { useTranslations } from 'next-intl';
import { Btn } from '@/components/atoms';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function EmailConfigPage() {
  const t = useTranslations('pages.construction');
  const router = useRouter();
  const locale = useLocale();

  const handleBackToList = () => {
    router.push(`/${locale}/dashboard/configuracion`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>
        
        <Btn
          variant="primary"
          onClick={handleBackToList}
          className="w-full"
        >
          {t('backToList')}
        </Btn>
      </div>
    </div>
  );
} 