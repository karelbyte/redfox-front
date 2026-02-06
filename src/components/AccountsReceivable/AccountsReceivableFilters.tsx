"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountReceivableStatus } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { Btn, Input, Select } from '@/components/atoms';

interface AccountsReceivableFiltersProps {
  filters: {
    search: string;
    status: AccountReceivableStatus | undefined;
    clientId: number | undefined;
    startDate: string;
    endDate: string;
  };
  clients: Client[];
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export default function AccountsReceivableFilters({ filters, clients, onFiltersChange, onClose }: AccountsReceivableFiltersProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: undefined,
      clientId: undefined,
      startDate: '',
      endDate: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  const statusOptions = [
    { value: '', label: t('filters.allStatuses') },
    { value: AccountReceivableStatus.PENDING, label: t('status.pending') },
    { value: AccountReceivableStatus.PARTIAL, label: t('status.partial') },
    { value: AccountReceivableStatus.PAID, label: t('status.paid') },
    { value: AccountReceivableStatus.OVERDUE, label: t('status.overdue') },
    { value: AccountReceivableStatus.CANCELLED, label: t('status.cancelled') },
  ];

  const clientOptions = [
    { value: '', label: t('filters.allClients') },
    ...clients.map(client => ({
      value: client.id.toString(),
      label: client.name,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('filters.title')}</h3>
        <button
          type="button"
          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={onClose}
        >
          <span className="sr-only">{tCommon('actions.close')}</span>
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            type="text"
            id="search"
            label={t('filters.search')}
            value={localFilters.search}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder={t('filters.searchPlaceholder')}
          />
        </div>

        <div>
          <Select
            id="status"
            label={t('filters.status')}
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters(prev => ({ 
              ...prev, 
              status: e.target.value ? e.target.value as AccountReceivableStatus : undefined 
            }))}
            options={statusOptions}
          />
        </div>

        <div>
          <Select
            id="clientId"
            label={t('filters.client')}
            value={localFilters.clientId?.toString() || ''}
            onChange={(e) => setLocalFilters(prev => ({ 
              ...prev, 
              clientId: e.target.value ? Number(e.target.value) : undefined 
            }))}
            options={clientOptions}
          />
        </div>

        <div>
          <Input
            type="date"
            id="startDate"
            label={t('filters.startDate')}
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div>
          <Input
            type="date"
            id="endDate"
            label={t('filters.endDate')}
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <Btn
          variant="outline"
          onClick={handleClearFilters}
        >
          {tCommon('actions.clear')}
        </Btn>
        <Btn
          variant="primary"
          onClick={handleApplyFilters}
        >
          {tCommon('actions.apply')}
        </Btn>
      </div>
    </div>
  );
}