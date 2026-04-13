'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface DayOfWeekChartProps {
  data: Array<{ day: string; sales: number; revenue: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function DayOfWeekChart({ data, themeColors }: DayOfWeekChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <p style={{ color: themeColors.primary }}>{t('sales')}: <strong>{payload[0].value}</strong></p>
          <p style={{ color: themeColors.dark }}>{t('revenue')}: <strong>{formatCurrency(payload[1]?.value ?? 0)}</strong></p>
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
          <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="sales" fill={themeColors.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="revenue" fill={themeColors.dark} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
