'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';

interface CarrierDeliveryChartProps {
  data: Array<{ carrier: string; avgDays: number; shipments: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function CarrierDeliveryChart({ data, themeColors }: CarrierDeliveryChartProps) {
  const t = useTranslations('pages.dashboard.analytics');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.carrier}</p>
          <p style={{ color: themeColors.primary }}>{t('avgDays')}: <strong>{item.avgDays.toFixed(1)}</strong></p>
          <p style={{ color: themeColors.dark }}>{t('shipments')}: <strong>{item.shipments}</strong></p>
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
          <XAxis dataKey="carrier" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} unit={` ${t('days')}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => <Cell key={i} fill={themeColors.primary} fillOpacity={1 - i * 0.08} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
