"use client";

import { useTranslations } from 'next-intl';
import AccountsPayableList from '@/components/AccountsPayable/AccountsPayableList';

export default function AccountsPayablePage() {
  const t = useTranslations('navigation');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('accountsPayable')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('accountsPayableDescription')}
          </p>
        </div>

        <AccountsPayableList />
      </div>
    </div>
  );
}