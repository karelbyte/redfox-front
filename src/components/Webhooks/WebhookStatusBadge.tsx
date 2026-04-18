'use client';

import React from 'react';
import { WebhookStatus } from '@/services/webhooks.service';

interface WebhookStatusBadgeProps {
  status: WebhookStatus;
  locale: string;
}

const statusTranslations = {
  es: {
    active: 'Activo',
    inactive: 'Inactivo',
    failed: 'Fallido',
  },
  en: {
    active: 'Active',
    inactive: 'Inactive',
    failed: 'Failed',
  },
  zh: {
    active: '已激活',
    inactive: '未激活',
    failed: '失败',
  },
} as const;

export const WebhookStatusBadge: React.FC<WebhookStatusBadgeProps> = ({ status, locale }) => {
  const localeKey = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es';
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusLabel = statusTranslations[localeKey][status] ?? status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {statusLabel}
    </span>
  );
};
