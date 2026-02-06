"use client";

import { useTranslations } from 'next-intl';
import { CashFlowMovement } from '@/types/cash-flow';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CashFlowChartProps {
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowChart({ movements, isLoading }: CashFlowChartProps) {
  const t = useTranslations('cashFlow');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = movements
    .slice()
    .reverse()
    .map((movement) => ({
      date: new Date(movement.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      balance: movement.balance,
      income: movement.type === 'income' || movement.type === 'receivable' ? Math.abs(movement.amount) : 0,
      expense: movement.type === 'expense' || movement.type === 'payable' ? Math.abs(movement.amount) : 0,
    }));

  const aggregatedData = chartData.reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.date);
    if (existing) {
      existing.income += current.income;
      existing.expense += current.expense;
      existing.balance = current.balance;
    } else {
      acc.push(current);
    }
    return acc;
  }, [] as typeof chartData);

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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('chart.balanceTrend')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="rgb(var(--color-primary-600))"
              strokeWidth={2}
              dot={{ fill: 'rgb(var(--color-primary-600))' }}
              name={t('chart.balance')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('chart.incomeVsExpense')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name={t('chart.income')} />
            <Bar dataKey="expense" fill="#ef4444" name={t('chart.expense')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
