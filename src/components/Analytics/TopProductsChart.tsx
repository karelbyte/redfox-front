'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface TopProductsChartProps {
  data: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  themeColors: {
    primary: string;
    light: string;
    dark: string;
  };
}

export default function TopProductsChart({ data, themeColors }: TopProductsChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const truncateName = (name: string, maxLength: number = 18) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '…' : name;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          className="p-3 rounded-lg shadow-lg border text-sm"
          style={{ backgroundColor: 'white', borderColor: themeColors.light }}
        >
          <p className="font-semibold text-gray-900 mb-1">{item.productName}</p>
          <p style={{ color: themeColors.primary }}>
            {t('totalSold')}: <strong>{item.totalSold}</strong>
          </p>
          <p style={{ color: themeColors.dark }}>
            {t('revenue')}: <strong>{formatCurrency(item.revenue)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const top10 = data.slice(0, 10);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="productName"
            stroke="#6b7280"
            fontSize={11}
            width={130}
            tickLine={false}
            axisLine={false}
            tickFormatter={truncateName}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="totalSold" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {top10.map((_, index) => (
              <Cell
                key={index}
                fill={themeColors.primary}
                fillOpacity={1 - index * 0.07}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
