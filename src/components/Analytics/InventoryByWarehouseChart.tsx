'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface InventoryByWarehouseChartProps {
  data: Array<{ warehouseId: string; warehouseName: string; value: number; products: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

export default function InventoryByWarehouseChart({ data, themeColors }: InventoryByWarehouseChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const truncate = (s: string, n = 14) => s.length > n ? s.slice(0, n) + '…' : s;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.warehouseName}</p>
          <p style={{ color: themeColors.primary }}>{t('value')}: <strong>{formatCurrency(item.value)}</strong></p>
          <p style={{ color: themeColors.dark }}>{t('products')}: <strong>{item.products}</strong></p>
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
          <XAxis dataKey="warehouseName" stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={truncate} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, 'MXN', true)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => <Cell key={i} fill={themeColors.primary} fillOpacity={1 - i * 0.07} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
