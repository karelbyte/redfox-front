"use client";

import { useTranslations } from 'next-intl';
import { CashFlowMovement } from '@/types/cash-flow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface CashFlowPredictionProps {
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowPrediction({ movements, isLoading }: CashFlowPredictionProps) {
  const t = useTranslations('cashFlow');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const predictFutureBalance = () => {
    if (movements.length < 7) return [];

    const lastWeek = movements.slice(0, 7);
    const avgDailyChange = lastWeek.reduce((sum, m) => sum + m.amount, 0) / 7;

    const predictions = [];
    const lastBalance = movements[0]?.balance || 0;

    for (let i = 1; i <= 30; i++) {
      const predictedBalance = lastBalance + avgDailyChange * i;
      predictions.push({
        day: `+${i}d`,
        predicted: predictedBalance,
        trend: avgDailyChange > 0 ? 'positive' : 'negative',
      });
    }

    return predictions;
  };

  const predictions = predictFutureBalance();

  const calculateInsights = () => {
    if (movements.length === 0) return [];

    const insights = [];
    const lastWeek = movements.slice(0, 7);
    const avgDaily = lastWeek.reduce((sum, m) => sum + m.amount, 0) / 7;

    if (avgDaily > 0) {
      insights.push({
        type: 'positive',
        title: t('prediction.positiveOutlook'),
        message: t('prediction.positiveMessage'),
      });
    } else if (avgDaily < 0) {
      insights.push({
        type: 'warning',
        title: t('prediction.warningOutlook'),
        message: t('prediction.warningMessage'),
      });
    }

    const incomeMovements = movements.filter(m => m.type === 'income' || m.type === 'receivable');
    const expenseMovements = movements.filter(m => m.type === 'expense' || m.type === 'payable');

    if (incomeMovements.length > expenseMovements.length) {
      insights.push({
        type: 'info',
        title: t('prediction.moreIncome'),
        message: t('prediction.moreIncomeMessage'),
      });
    }

    return insights;
  };

  const insights = calculateInsights();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('prediction.title')}</h3>
        {predictions.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="rgb(var(--color-primary-600))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={t('prediction.predictedBalance')}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('prediction.insufficientData')}
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5" />
            {t('prediction.insights')}
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const bgColor = {
                positive: 'bg-green-50 border-green-200',
                warning: 'bg-yellow-50 border-yellow-200',
                info: 'bg-blue-50 border-blue-200',
              }[insight.type];

              const textColor = {
                positive: 'text-green-800',
                warning: 'text-yellow-800',
                info: 'text-blue-800',
              }[insight.type];

              return (
                <div key={index} className={`border rounded-lg p-4 ${bgColor}`}>
                  <h4 className={`font-semibold text-sm ${textColor}`}>{insight.title}</h4>
                  <p className={`text-sm mt-1 ${textColor}`}>{insight.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
