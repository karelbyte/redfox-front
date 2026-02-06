"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType } from '@/types/cash-flow';
import { cashFlowService } from '@/services/cash-flow.service';
import { toastService } from '@/services/toast.service';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface CashFlowComparisonProps {
  currentSummary: CashFlowSummaryType;
  isLoading?: boolean;
}

export default function CashFlowComparison({ currentSummary, isLoading }: CashFlowComparisonProps) {
  const t = useTranslations('cashFlow');
  const [previousSummary, setPreviousSummary] = useState<CashFlowSummaryType | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  const loadPreviousPeriod = async () => {
    try {
      setIsLoadingComparison(true);
      const today = new Date();
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      const summary = await cashFlowService.getSummary(
        lastMonthStart.toISOString().split('T')[0],
        lastMonthEnd.toISOString().split('T')[0],
      );

      setPreviousSummary(summary);
    } catch (error) {
      console.error('Error loading previous period:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return 'text-green-600';
    if (variation < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const ComparisonRow = ({ label, current, previous }: { label: string; current: number; previous: number | null }) => {
    const variation = previous !== null ? calculateVariation(current, previous) : 0;
    const isPositive = variation > 0;

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(current)}</p>
            {previous !== null && (
              <p className="text-xs text-gray-500">{formatCurrency(previous)}</p>
            )}
          </div>
          {previous !== null && (
            <div className={`flex items-center gap-1 ${getVariationColor(variation)}`}>
              {isPositive ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{Math.abs(variation).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('comparison.title')}</h3>
        <button
          onClick={loadPreviousPeriod}
          disabled={isLoadingComparison}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
        >
          {isLoadingComparison ? t('comparison.loading') : t('comparison.loadPrevious')}
        </button>
      </div>

      {previousSummary ? (
        <div className="space-y-2">
          <ComparisonRow
            label={t('summary.totalIncome')}
            current={currentSummary.totalIncome}
            previous={previousSummary.totalIncome}
          />
          <ComparisonRow
            label={t('summary.totalExpenses')}
            current={currentSummary.totalExpenses}
            previous={previousSummary.totalExpenses}
          />
          <ComparisonRow
            label={t('summary.netCashFlow')}
            current={currentSummary.netCashFlow}
            previous={previousSummary.netCashFlow}
          />
          <ComparisonRow
            label={t('summary.projectedBalance')}
            current={currentSummary.projectedBalance}
            previous={previousSummary.projectedBalance}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-4">{t('comparison.noPreviousData')}</p>
          <button
            onClick={loadPreviousPeriod}
            disabled={isLoadingComparison}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isLoadingComparison ? t('comparison.loading') : t('comparison.loadPrevious')}
          </button>
        </div>
      )}
    </div>
  );
}
