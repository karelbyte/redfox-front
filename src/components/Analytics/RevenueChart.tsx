'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface RevenueChartProps {
  data: Array<{
    month: string;
    invoiced: number;
    collected: number;
  }>;
  themeColors: {
    primary: string;
    light: string;
    dark: string;
  };
}

export default function RevenueChart({ data, themeColors }: RevenueChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const formatXAxisLabel = (value: string) => {
    return new Date(value + '-01').toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'white',
            borderColor: themeColors.light 
          }}
        >
          <p className="font-medium text-gray-900 mb-2">
            {formatXAxisLabel(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: themeColors.primary }}>
              {t('invoiced')}: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm" style={{ color: themeColors.dark }}>
              {t('collected')}: {formatCurrency(payload[1].value)}
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
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month"
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => t(value)}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar 
            dataKey="invoiced" 
            fill={themeColors.primary}
            name="invoiced"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="collected" 
            fill={themeColors.dark}
            name="collected"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}