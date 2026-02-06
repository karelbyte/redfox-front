"use client";

import { useTranslations } from 'next-intl';
import { CashFlowProjection as CashFlowProjectionType } from '@/types/cash-flow';

interface CashFlowProjectionProps {
  projections: CashFlowProjectionType[];
  isLoading?: boolean;
}

export default function CashFlowProjection({ projections, isLoading }: CashFlowProjectionProps) {
  const t = useTranslations('cashFlow');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t('projection.title')}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {projections && projections.length > 0 ? projections.map((projection, index) => (
          <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                {formatDate(projection.period)}
              </h4>
              <span className={`text-lg font-bold ${
                projection.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(projection.projectedBalance)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">{t('projection.income')}</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(projection.projectedIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">{t('projection.expenses')}</p>
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(projection.projectedExpenses)}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-6 text-center text-sm text-gray-500">
            {t('empty.noProjections')}
          </div>
        )}
      </div>
    </div>
  );
}
