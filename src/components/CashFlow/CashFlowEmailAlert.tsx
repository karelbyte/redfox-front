"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType } from '@/types/cash-flow';
import { BellIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { toastService } from '@/services/toast.service';
import { emailConfigService } from '@/services/email-config.service';

interface CashFlowEmailAlertProps {
  summary: CashFlowSummaryType;
  isLoading?: boolean;
}

export default function CashFlowEmailAlert({ summary, isLoading }: CashFlowEmailAlertProps) {
  const t = useTranslations('cashFlow');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [alertsSent, setAlertsSent] = useState(false);
  const [hasEmailConfig, setHasEmailConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const checkEmailConfig = async () => {
    try {
      await emailConfigService.getConfig();
      setHasEmailConfig(true);
      setConfigError(null);
    } catch (error) {
      setHasEmailConfig(false);
      setConfigError(t('emailAlert.noConfig'));
    }
  };

  const sendEmailAlert = async () => {
    if (!email) {
      toastService.error(t('emailAlert.emailRequired'));
      return;
    }

    if (!hasEmailConfig) {
      toastService.error(t('emailAlert.noConfig'));
      return;
    }

    try {
      setIsSending(true);
      
      const alertMessage = summary.netCashFlow < 0
        ? `⚠️ Alerta de Flujo de Caja Negativo\n\nTu flujo de caja es negativo:\nIngresos: $${summary.totalIncome}\nEgresos: $${summary.totalExpenses}\nFlujo Neto: $${summary.netCashFlow}`
        : `📊 Reporte de Flujo de Caja\n\nIngresos: $${summary.totalIncome}\nEgresos: $${summary.totalExpenses}\nFlujo Neto: $${summary.netCashFlow}\nSaldo Proyectado: $${summary.projectedBalance}`;

      // Simular envío de correo (en producción, esto iría al backend)
      await new Promise(resolve => setTimeout(resolve, 1500));

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
    if (e.key === 'Enter' && !isSending && email && hasEmailConfig) {
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

      {configError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{configError}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('emailAlert.placeholder')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isSending || !hasEmailConfig}
        />
        <button
          onClick={sendEmailAlert}
          disabled={isSending || !email || !hasEmailConfig}
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
