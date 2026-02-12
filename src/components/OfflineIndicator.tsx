"use client";

import { useOffline } from '@/hooks/useOffline';
import { useTranslations } from 'next-intl';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function OfflineIndicator() {
  const { isOnline, wasOffline, isSyncing, pendingCount, manualSync } = useOffline();
  const t = useTranslations('offline');

  if (isOnline && !wasOffline && !isSyncing && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {!isOnline ? (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{t('offline')}</span>
            {pendingCount > 0 && (
              <span className="bg-red-700 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} {t('pendingOperations', { count: pendingCount })}
              </span>
            )}
          </div>
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('syncing')}</span>
            {pendingCount > 0 && (
              <span className="bg-blue-700 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} {t('remaining')}
              </span>
            )}
          </div>
        </div>
      ) : wasOffline ? (
        <div className="bg-green-500 text-white px-4 py-2 text-center text-sm animate-pulse">
          <div className="flex items-center justify-center">
            <WifiIcon className="h-4 w-4 mr-2" />
            {t('backOnline')}
          </div>
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{pendingCount} {t('pendingOperations', { count: pendingCount })}</span>
            <button
              onClick={manualSync}
              className="ml-2 bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              {t('syncNow')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}