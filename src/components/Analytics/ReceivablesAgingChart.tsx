'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface ReceivablesAgingChartProps {
  data: Array<{ bucket: string; count: number; amount: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

const BUCKET_COLORS = ['#22c55e', '#f59e0b', '#f97316', '#ef4444'];

export default function ReceivablesAgingChart({ data, themeColors }: ReceivablesAgingChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{label} {t('agingDays')}</p>
          <p className="text-gray-600">{t('count')}: <strong>{item.count}</strong></p>
          <p className="text-gray-600">{t('amount')}: <strong>{formatCurrency(item.amount)}</strong></p>
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
          <XAxis dataKey="bucket" stroke="#9ca3af" fontSize={12} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, 'MXN', true)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={64}>
            {data.map((_, i) => <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
