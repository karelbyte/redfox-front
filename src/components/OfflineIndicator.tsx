"use client";

import { useOffline } from '@/hooks/useOffline';
import { useTranslations } from 'next-intl';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOffline();
  const t = useTranslations('offline');

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      {!isOnline ? (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            {t('offline')}
          </div>
        </div>
      ) : wasOffline ? (
        <div className="bg-green-500 text-white px-4 py-2 text-center text-sm animate-pulse">
          <div className="flex items-center justify-center">
            <WifiIcon className="h-4 w-4 mr-2" />
            {t('backOnline')}
          </div>
        </div>
      ) : null}
    </div>
  );
}