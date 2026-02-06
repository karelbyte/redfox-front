"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AccountPayableStatus } from '@/types/account-payable';
import { Input, Select } from '@/components/atoms';

interface AccountsPayableFiltersProps {
  onSearch: (search: string) => void;
  onStatusChange: (status: AccountPayableStatus | '') => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function AccountsPayableFilters({
  onSearch,
  onStatusChange,
  onDateRangeChange,
}: AccountsPayableFiltersProps) {
  const t = useTranslations('accountsPayable');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AccountPayableStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as AccountPayableStatus | '';
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const statusOptions = [
    { value: '', label: t('filters.allStatuses') },
    { value: AccountPayableStatus.PENDING, label: t('status.pending') },
    { value: AccountPayableStatus.PARTIAL, label: t('status.partial') },
    { value: AccountPayableStatus.PAID, label: t('status.paid') },
    { value: AccountPayableStatus.OVERDUE, label: t('status.overdue') },
    { value: AccountPayableStatus.CANCELLED, label: t('status.cancelled') },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="text"
          id="search"
          label={t('filters.search')}
          placeholder={t('filters.searchPlaceholder')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          id="status"
          label={t('filters.status')}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={statusOptions}
        />

        <Input
          type="date"
          id="startDate"
          label={t('filters.startDate')}
          value={startDate}
          onChange={(e) => handleDateChange(e.target.value, endDate)}
        />

        <Input
          type="date"
          id="endDate"
          label={t('filters.endDate')}
          value={endDate}
          onChange={(e) => handleDateChange(startDate, e.target.value)}
        />
      </div>
    </div>
  );
}
