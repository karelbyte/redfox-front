"use client";

import { useTranslations } from 'next-intl';

export default function CashFlowPage() {
  const t = useTranslations('navigation');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('cashFlow')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              This feature is coming soon. Monitor your cash flow and financial projections here.
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Cash Flow</h3>
            <p className="mt-1 text-sm text-gray-500">
              This module will provide detailed cash flow analysis, financial projections, and liquidity management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}