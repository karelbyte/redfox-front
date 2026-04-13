'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface SalesByUserChartProps {
  data: Array<{ userId: string; userName: string; sales: number; revenue: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function SalesByUserChart({ data, themeColors }: SalesByUserChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const truncate = (s: string, n = 16) => s.length > n ? s.slice(0, n) + '…' : s;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.userName}</p>
          <p style={{ color: themeColors.primary }}>{t('sales')}: <strong>{item.sales}</strong></p>
          <p style={{ color: themeColors.dark }}>{t('revenue')}: <strong>{formatCurrency(item.revenue)}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="userName" stroke="#6b7280" fontSize={11} width={120} tickLine={false} axisLine={false} tickFormatter={truncate} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((_, i) => <Cell key={i} fill={themeColors.primary} fillOpacity={1 - i * 0.08} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
