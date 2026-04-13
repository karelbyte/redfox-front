'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface IncomeVsExpensesChartProps {
  data: Array<{ month: string; income: number; expenses: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function IncomeVsExpensesChart({ data, themeColors }: IncomeVsExpensesChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const formatMonth = (v: string) => new Date(v + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{formatMonth(label)}</p>
          <p style={{ color: themeColors.primary }}>{t('income')}: <strong>{formatCurrency(payload[0]?.value ?? 0)}</strong></p>
          <p style={{ color: '#ef4444' }}>{t('expenses')}: <strong>{formatCurrency(payload[1]?.value ?? 0)}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, 'MXN', true)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(value) => t(value)} />
          <Bar dataKey="income" fill={themeColors.primary} radius={[4, 4, 0, 0]} maxBarSize={32} name="income" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
