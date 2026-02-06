"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType } from '@/types/cash-flow';
import { cashFlowService } from '@/services/cash-flow.service';
import { toastService } from '@/services/toast.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface CashFlowYearComparisonProps {
  currentSummary: CashFlowSummaryType;
  isLoading?: boolean;
}

export default function CashFlowYearComparison({ currentSummary, isLoading }: CashFlowYearComparisonProps) {
  const t = useTranslations('cashFlow');
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  const loadYearComparison = async () => {
    try {
      setIsLoadingComparison(true);
      const today = new Date();
      const months = [];

      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

        const summary = await cashFlowService.getSummary(
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0],
        );

        months.push({
          month: monthStart.toLocaleDateString('es-MX', { month: 'short' }),
          income: summary.totalIncome,
          expense: summary.totalExpenses,
          netFlow: summary.netCashFlow,
        });
      }

      setMonthlyData(months);
    } catch (error) {
      console.error('Error loading year comparison:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const calculateYearTrend = () => {
    if (monthlyData.length === 0) return { trend: 'neutral', percentage: 0 };

    const firstHalf = monthlyData.slice(0, 6);
    const secondHalf = monthlyData.slice(6);

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.netFlow, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.netFlow, 0) / secondHalf.length;

    const change = secondHalfAvg - firstHalfAvg;
    const percentage = firstHalfAvg !== 0 ? Math.abs((change / firstHalfAvg) * 100) : 0;

    return {
      trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      percentage: Math.round(percentage),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact',
    }).format(value);
  };

  const yearTrend = calculateYearTrend();

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('yearComparison.title')}</h3>
        <button
          onClick={loadYearComparison}
          disabled={isLoadingComparison}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
        >
          {isLoadingComparison ? t('yearComparison.loading') : t('yearComparison.load')}
        </button>
      </div>

      {monthlyData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">{t('yearComparison.yearTrend')}</p>
              <div className="flex items-center gap-2">
                {yearTrend.direction === 'up' ? (
                  <ArrowUpIcon className="w-5 h-5 text-green-600" />
                ) : yearTrend.direction === 'down' ? (
                  <ArrowDownIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center text-gray-600">—</div>
                )}
                <span className="text-2xl font-bold text-gray-900">{yearTrend.percentage}%</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">{t('yearComparison.totalIncome')}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0))}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">{t('yearComparison.totalExpense')}</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyData.reduce((sum, m) => sum + m.expense, 0))}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name={t('chart.income')} />
              <Bar dataKey="expense" fill="#ef4444" name={t('chart.expense')} />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-4">{t('yearComparison.noData')}</p>
          <button
            onClick={loadYearComparison}
            disabled={isLoadingComparison}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isLoadingComparison ? t('yearComparison.loading') : t('yearComparison.load')}
          </button>
        </div>
      )}
    </div>
  );
}
