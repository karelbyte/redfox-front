"use client";

import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType } from '@/types/cash-flow';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface CashFlowSummaryProps {
  data: CashFlowSummaryType;
  isLoading?: boolean;
}

export default function CashFlowSummary({ data, isLoading }: CashFlowSummaryProps) {
  const t = useTranslations('cashFlow');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getBalanceColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const cards = [
    {
      label: t('summary.totalIncome'),
      value: data.totalIncome,
      icon: ArrowUpIcon,
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: t('summary.totalExpenses'),
      value: data.totalExpenses,
      icon: ArrowDownIcon,
      color: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: t('summary.netCashFlow'),
      value: data.netCashFlow,
      icon: data.netCashFlow >= 0 ? ArrowUpIcon : ArrowDownIcon,
      color: data.netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      textColor: data.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600',
    },
    {
      label: t('summary.projectedBalance'),
      value: data.projectedBalance,
      icon: data.projectedBalance >= 0 ? ArrowUpIcon : ArrowDownIcon,
      color: data.projectedBalance >= 0 ? 'bg-purple-50' : 'bg-pink-50',
      textColor: getBalanceColor(data.projectedBalance),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{card.label}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
