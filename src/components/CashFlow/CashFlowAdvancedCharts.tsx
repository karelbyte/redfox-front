"use client";

import { useTranslations } from 'next-intl';
import { CashFlowMovement } from '@/types/cash-flow';
import {
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CashFlowAdvancedChartsProps {
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowAdvancedCharts({ movements, isLoading }: CashFlowAdvancedChartsProps) {
  const t = useTranslations('cashFlow');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const movementsByType = movements.reduce((acc, movement) => {
    const existing = acc.find(item => item.type === movement.type);
    if (existing) {
      existing.value += Math.abs(movement.amount);
    } else {
      acc.push({
        type: t(`movements.type.${movement.type}`),
        value: Math.abs(movement.amount),
        originalType: movement.type,
      });
    }
    return acc;
  }, [] as Array<{ type: string; value: number; originalType: string }>);

  const chartData = movements
    .slice()
    .reverse()
    .map((movement) => ({
      date: new Date(movement.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      income: movement.type === 'income' || movement.type === 'receivable' ? Math.abs(movement.amount) : 0,
      expense: movement.type === 'expense' || movement.type === 'payable' ? Math.abs(movement.amount) : 0,
    }));

  const aggregatedAreaData = chartData.reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.date);
    if (existing) {
      existing.income += current.income;
      existing.expense += current.expense;
    } else {
      acc.push(current);
    }
    return acc;
  }, [] as typeof chartData);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('chart.movementsByType')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={movementsByType}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ value, payload }) => `${payload?.type}: ${formatCurrency(value)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {movementsByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('chart.cumulativeFlow')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={aggregatedAreaData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorIncome)"
              name={t('chart.income')}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorExpense)"
              name={t('chart.expense')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
