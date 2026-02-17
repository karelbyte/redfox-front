"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AccountReceivableStatus } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { Input, Select } from '@/components/atoms';

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
}

export default function AccountsReceivableFilters({ filters, clients, onFiltersChange }: AccountsReceivableFiltersProps) {
  const t = useTranslations('accountsReceivable');

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
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
    <div className="flex items-end gap-3">
      <div className="w-64">
        <Input
          type="text"
          id="search"
          label={t('filters.search')}
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
        />
      </div>

      <div className="w-48">
        <Select
          id="status"
          label={t('filters.status')}
          value={localFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value ? e.target.value as AccountReceivableStatus : undefined)}
          options={statusOptions}
        />
      </div>

      <div className="w-48">
        <Select
          id="clientId"
          label={t('filters.client')}
          value={localFilters.clientId?.toString() || ''}
          onChange={(e) => handleFilterChange('clientId', e.target.value ? Number(e.target.value) : undefined)}
          options={clientOptions}
        />
      </div>
    </div>
  );
}