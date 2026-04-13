'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface TopClientsChartProps {
  data: Array<{ clientId: string; clientName: string; totalPurchases: number; totalSpent: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function TopClientsChart({ data, themeColors }: TopClientsChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const truncate = (s: string, n = 18) => s.length > n ? s.slice(0, n) + '…' : s;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.clientName}</p>
          <p style={{ color: themeColors.primary }}>{t('totalSpent')}: <strong>{formatCurrency(item.totalSpent)}</strong></p>
          <p style={{ color: themeColors.dark }}>{t('purchases')}: <strong>{item.totalPurchases}</strong></p>
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
          <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, 'MXN', true)} />
          <YAxis type="category" dataKey="clientName" stroke="#6b7280" fontSize={11} width={130} tickLine={false} axisLine={false} tickFormatter={truncate} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="totalSpent" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((_, i) => <Cell key={i} fill={themeColors.primary} fillOpacity={1 - i * 0.07} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
