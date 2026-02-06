"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType } from '@/types/cash-flow';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toastService } from '@/services/toast.service';

interface CashFlowEmailAlertProps {
  summary: CashFlowSummaryType;
  isLoading?: boolean;
}

export default function CashFlowEmailAlert({ summary, isLoading }: CashFlowEmailAlertProps) {
  const t = useTranslations('cashFlow');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [alertsSent, setAlertsSent] = useState(false);

  const sendEmailAlert = async () => {
    if (!email) {
      toastService.error(t('emailAlert.emailRequired'));
      return;
    }

    try {
      setIsSending(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAlertsSent(true);
      toastService.success(t('emailAlert.sent'));
      setEmail('');

      setTimeout(() => setAlertsSent(false), 3000);
    } catch (error) {
      console.error('Error sending email alert:', error);
      toastService.error(t('emailAlert.error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendEmailAlert();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BellIcon className="w-5 h-5" />
          {t('emailAlert.title')}
        </h3>
        {alertsSent && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckIcon className="w-5 h-5" />
            <span className="text-sm">{t('emailAlert.sent')}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{t('emailAlert.description')}</p>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('emailAlert.placeholder')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isSending}
        />
        <button
          onClick={sendEmailAlert}
          disabled={isSending || !email}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isSending ? t('emailAlert.sending') : t('emailAlert.send')}
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>{t('emailAlert.note')}:</strong> {t('emailAlert.noteText')}
        </p>
      </div>
    </div>
  );
}
