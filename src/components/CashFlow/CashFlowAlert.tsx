"use client";

import { useTranslations } from 'next-intl';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CashFlowAlertProps {
  netCashFlow: number;
  projectedBalance: number;
}

export default function CashFlowAlert({ netCashFlow, projectedBalance }: CashFlowAlertProps) {
  const t = useTranslations('cashFlow');

  const alerts = [];

  if (netCashFlow < 0) {
    alerts.push({
      type: 'negative-flow',
      severity: 'warning',
      title: t('alerts.negativeFlow.title'),
      message: t('alerts.negativeFlow.message'),
      icon: ExclamationTriangleIcon,
    });
  }

  if (projectedBalance < 0) {
    alerts.push({
      type: 'negative-balance',
      severity: 'error',
      title: t('alerts.negativeBalance.title'),
      message: t('alerts.negativeBalance.message'),
      icon: ExclamationTriangleIcon,
    });
  }

  if (netCashFlow > 0 && projectedBalance > 0) {
    alerts.push({
      type: 'positive-flow',
      severity: 'success',
      title: t('alerts.positiveFlow.title'),
      message: t('alerts.positiveFlow.message'),
      icon: CheckCircleIcon,
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.type}
            className={`border rounded-lg p-4 flex items-start gap-3 ${getAlertStyles(alert.severity)}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getIconColor(alert.severity)}`} />
            <div>
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-sm mt-1">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
