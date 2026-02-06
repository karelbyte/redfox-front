"use client";

import { useTranslations } from 'next-intl';

export default function AccountsPayablePage() {
  const t = useTranslations('navigation');

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('accountsPayable')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              This feature is coming soon. Manage your accounts payable here.
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Accounts Payable</h3>
            <p className="mt-1 text-sm text-gray-500">
              This module will allow you to manage your accounts payable, track payments to suppliers, and monitor outstanding balances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}