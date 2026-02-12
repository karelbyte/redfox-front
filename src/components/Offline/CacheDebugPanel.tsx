"use client";

import { useCacheManager } from '@/hooks/useCacheManager';
import { useOffline } from '@/hooks/useOffline';
import { useTranslations } from 'next-intl';
import { 
  ArrowPathIcon, 
  TrashIcon, 
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CacheDebugPanel() {
  const { stats, health, isLoading, preloadData, cleanOldData, clearCache, refreshStats } = useCacheManager();
  const { isOnline, pendingCount, manualSync } = useOffline();
  const t = useTranslations('offline');

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Offline Cache Manager
        </h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
      </div>

      {/* Health Status */}
      <div className={`p-4 rounded-lg ${
        health.isHealthy ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {health.isHealthy ? (
            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className={`font-medium ${
              health.isHealthy ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {health.isHealthy ? 'Cache is healthy' : 'Cache has issues'}
            </h4>
            {health.issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {health.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    • {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cached Providers</div>
          <div className="text-2xl font-bold text-gray-900">{stats.providersCount}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cached Clients</div>
          <div className="text-2xl font-bold text-gray-900">{stats.clientsCount}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Pending Operations</div>
          <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Cache Size</div>
          <div className="text-2xl font-bold text-gray-900">{stats.cacheSize}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg col-span-2">
          <div className="text-sm text-gray-600">Last Sync</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(stats.lastSync)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={refreshStats}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>

        {isOnline && (
          <>
            <button
              onClick={preloadData}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CloudArrowDownIcon className="h-5 w-5" />
              Preload All Data
            </button>

            {pendingCount > 0 && (
              <button
                onClick={manualSync}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Sync Now ({pendingCount})
              </button>
            )}
          </>
        )}

        <button
          onClick={cleanOldData}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
          Clean Old Data
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
              clearCache();
            }
          }}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
          Clear All Cache
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Preload: Downloads all providers for offline use</p>
        <p>• Clean: Removes data older than 30 days</p>
        <p>• Clear: Removes all cached data (use with caution)</p>
      </div>
    </div>
  );
}
