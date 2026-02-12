"use client";

import { useState, useEffect } from 'react';
import { db, PendingOperation } from '@/lib/db';
import { syncManager } from '@/services/offline/sync-manager';
import { useTranslations } from 'next-intl';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function FailedOperationsPanel() {
  const [failedOps, setFailedOps] = useState<PendingOperation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const t = useTranslations('offline');

  const loadFailedOperations = async () => {
    const failed = await db.pendingOperations
      .where('retries')
      .aboveOrEqual(3)
      .toArray();
    setFailedOps(failed);
    
    // Auto-open if there are failed operations
    if (failed.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    loadFailedOperations();

    // Refresh every 30 seconds
    const interval = setInterval(loadFailedOperations, 30000);
    return () => clearInterval(interval);
  }, []);

  const retryOperation = async (op: PendingOperation) => {
    if (!op.id) return;
    
    setIsRetrying(true);
    try {
      // Reset retry count
      await db.pendingOperations.update(op.id, {
        retries: 0,
        error: undefined
      });
      
      // Trigger sync
      await syncManager.processPendingOperations();
      
      // Reload failed operations
      await loadFailedOperations();
    } catch (error) {
      console.error('Error retrying operation:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const discardOperation = async (op: PendingOperation) => {
    if (!op.id) return;
    
    if (confirm('Are you sure you want to discard this operation? This cannot be undone.')) {
      await db.pendingOperations.delete(op.id);
      await loadFailedOperations();
    }
  };

  const retryAll = async () => {
    setIsRetrying(true);
    try {
      // Reset all failed operations
      for (const op of failedOps) {
        if (op.id) {
          await db.pendingOperations.update(op.id, {
            retries: 0,
            error: undefined
          });
        }
      }
      
      // Trigger sync
      await syncManager.processPendingOperations();
      
      // Reload
      await loadFailedOperations();
    } catch (error) {
      console.error('Error retrying all operations:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const discardAll = async () => {
    if (confirm(`Are you sure you want to discard all ${failedOps.length} failed operations? This cannot be undone.`)) {
      for (const op of failedOps) {
        if (op.id) {
          await db.pendingOperations.delete(op.id);
        }
      }
      await loadFailedOperations();
    }
  };

  if (failedOps.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        >
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="font-medium">{failedOps.length} Failed Operations</span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border border-red-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                Failed Operations ({failedOps.length})
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Operations list */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {failedOps.map((op) => (
              <div
                key={op.id}
                className="bg-gray-50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900 uppercase">
                        {op.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {op.entity}
                      </span>
                    </div>
                    {op.entityId && (
                      <div className="text-xs text-gray-600 mt-1">
                        ID: {op.entityId}
                      </div>
                    )}
                    {op.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {op.error}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Retries: {op.retries}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => retryOperation(op)}
                    disabled={isRetrying}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowPathIcon className="h-3 w-3" />
                    Retry
                  </button>
                  <button
                    onClick={() => discardOperation(op)}
                    disabled={isRetrying}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Discard
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={retryAll}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry All
            </button>
            <button
              onClick={discardAll}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Discard All
            </button>
          </div>
        </div>
      )}
    </>
  );
}
