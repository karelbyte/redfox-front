"use client";

import { useTranslations } from 'next-intl';
import CashFlowDashboard from '@/components/CashFlow/CashFlowDashboard';

export default function CashFlowPage() {
  const t = useTranslations('navigation');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cashFlow')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('cashFlowDescription')}
          </p>
        </div>

        <CashFlowDashboard />
      </div>
    </div>
  );
}