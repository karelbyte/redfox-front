"use client";

import { useTranslations } from 'next-intl';
import { CashFlowMovement } from '@/types/cash-flow';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface CashFlowTrendsProps {
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowTrends({ movements, isLoading }: CashFlowTrendsProps) {
  const t = useTranslations('cashFlow');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const calculateTrend = () => {
    if (movements.length < 2) {
      return { trend: 'neutral', percentage: 0, direction: 'neutral' };
    }

    const firstHalf = movements.slice(0, Math.floor(movements.length / 2));
    const secondHalf = movements.slice(Math.floor(movements.length / 2));

    const firstHalfBalance = firstHalf.reduce((sum, m) => sum + m.amount, 0);
    const secondHalfBalance = secondHalf.reduce((sum, m) => sum + m.amount, 0);

    const change = secondHalfBalance - firstHalfBalance;
    const percentage = firstHalfBalance !== 0 ? Math.abs((change / firstHalfBalance) * 100) : 0;

    return {
      trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      percentage: Math.round(percentage),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  const calculateAverageDaily = () => {
    if (movements.length === 0) return 0;
    const total = movements.reduce((sum, m) => sum + m.amount, 0);
    return total / movements.length;
  };

  const calculateVolatility = () => {
    if (movements.length < 2) return 0;
    const avg = calculateAverageDaily();
    const variance = movements.reduce((sum, m) => sum + Math.pow(m.amount - avg, 2), 0) / movements.length;
    return Math.sqrt(variance);
  };

  const trend = calculateTrend();
  const avgDaily = calculateAverageDaily();
  const volatility = calculateVolatility();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendLabel = (trendType: string) => {
    switch (trendType) {
      case 'improving':
        return t('trends.improving');
      case 'declining':
        return t('trends.declining');
      default:
        return t('trends.stable');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{t('trends.trend')}</p>
            <p className="text-2xl font-bold text-gray-900">{getTrendLabel(trend.trend)}</p>
            <p className="text-xs text-gray-500 mt-2">{trend.percentage}% change</p>
          </div>
          <div className={`p-3 rounded-lg ${getTrendColor(trend.direction)}`}>
            {trend.direction === 'up' ? (
              <ArrowUpIcon className="w-6 h-6" />
            ) : trend.direction === 'down' ? (
              <ArrowDownIcon className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">—</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('trends.averageDaily')}</p>
          <p className={`text-2xl font-bold ${avgDaily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(avgDaily)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{t('trends.perDay')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('trends.volatility')}</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(volatility)}</p>
          <p className="text-xs text-gray-500 mt-2">{t('trends.variability')}</p>
        </div>
      </div>
    </div>
  );
}
