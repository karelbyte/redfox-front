'use client';

import { useState } from 'react';
import { XMarkIcon, TrashIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { BulkAction } from '@/hooks/useBulkSelection';

interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClose: () => void;
  isLoading?: boolean;
}

import { useTranslations } from 'next-intl';

export default function BulkActionsBar({
  selectedCount,
  actions,
  onClose,
  isLoading = false,
}: BulkActionsBarProps) {
  const t = useTranslations('common.bulkActions');
  const tActions = useTranslations('common.actions');
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  const handleActionClick = async (action: BulkAction) => {
    if (action.requiresConfirm) {
      setConfirmingAction(action.id);
      return;
    }

    try {
      await action.onClick([]);
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  const handleConfirm = async (action: BulkAction) => {
    try {
      await action.onClick([]);
      setConfirmingAction(null);
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  if (confirmingAction) {
    const action = actions.find(a => a.id === confirmingAction);
    if (!action) return null;

    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-yellow-200 rounded-lg shadow-xl p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[400px]">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700 font-medium">
            {t('confirmMessage', { count: selectedCount })}
          </div>
          <div className="flex gap-2 shrink-0">
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => setConfirmingAction(null)}
              disabled={isLoading}
            >
              {tActions('cancel')}
            </Btn>
            <Btn
              variant="danger"
              size="sm"
              onClick={() => handleConfirm(action)}
              disabled={isLoading}
            >
              {isLoading ? t('processing') : tActions('confirm')}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[500px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 pl-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600">
            <CheckIcon className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {t('selectedCount', { count: selectedCount })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-px bg-gray-200 mx-1" />
          {actions.map(action => (
            <Btn
              key={action.id}
              variant={action.color === 'danger' ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={action.color === 'danger' ? '' : 'hover:bg-gray-100 border-transparent'}
            >
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              {action.label}
            </Btn>
          ))}

          <Btn
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </Btn>
        </div>
      </div>
    </div>
  );
}
