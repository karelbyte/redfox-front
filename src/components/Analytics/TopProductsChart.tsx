'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const truncateName = (name: string, maxLength: number = 15) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'white',
            borderColor: themeColors.light 
          }}
        >
          <p className="font-medium text-gray-900 mb-2">
            {data.productName}
          </p>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: themeColors.primary }}>
              {t('totalSold')}: {data.totalSold}
            </p>
            <p className="text-sm" style={{ color: themeColors.dark }}>
              {t('revenue')}: {formatCurrency(data.revenue)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            type="category"
            dataKey="productName"
            stroke="#666" 
            fontSize={12}
            width={75}
            tickFormatter={(value) => truncateName(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="totalSold" 
            fill={themeColors.primary}
            radius={[0, 2, 2, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}