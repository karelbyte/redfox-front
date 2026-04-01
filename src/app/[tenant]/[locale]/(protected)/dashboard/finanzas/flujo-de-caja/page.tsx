"use client";

import { useTranslations } from 'next-intl';
import CashFlowDashboard from '@/components/CashFlow/CashFlowDashboard';
import HelpButton from '@/components/Help/HelpButton';
import { cashFlowHelp } from '@/components/Help/configs/cash-flow.help';

export default function CashFlowPage() {
  const t = useTranslations('navigation');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{t('cashFlow')}</h1>
            <HelpButton config={cashFlowHelp} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t('cashFlowDescription')}
          </p>
        </div>

        <CashFlowDashboard />
      </div>
    </div>
  );
}