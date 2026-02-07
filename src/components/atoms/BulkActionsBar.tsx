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

export default function BulkActionsBar({
  selectedCount,
  actions,
  onClose,
  isLoading = false,
}: BulkActionsBarProps) {
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
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t-2 border-yellow-400 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">
              Are you sure you want to {action.label.toLowerCase()} {selectedCount} item(s)?
            </div>
          </div>
          <div className="flex gap-2">
            <Btn
              variant="secondary"
              onClick={() => setConfirmingAction(null)}
              disabled={isLoading}
            >
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={() => handleConfirm(action)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t-2 border-blue-400 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-900">
            {selectedCount} item(s) selected
          </div>
        </div>

        <div className="flex gap-2">
          {actions.map(action => (
            <Btn
              key={action.id}
              variant={action.color === 'danger' ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </Btn>
          ))}

          <Btn
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <XMarkIcon className="w-4 h-4" />
          </Btn>
        </div>
      </div>
    </div>
  );
}
