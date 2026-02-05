'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  type: 'daily' | 'monthly';
  themeColors: {
    primary: string;
    light: string;
    dark: string;
  };
}

export default function SalesChart({ data, type, themeColors }: SalesChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const formatXAxisLabel = (value: string) => {
    if (type === 'daily') {
      return new Date(value).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return new Date(value + '-01').toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
    }
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
              {t('sales')}: {payload[0].value}
            </p>
            <p className="text-sm" style={{ color: themeColors.dark }}>
              {t('revenue')}: {formatCurrency(payload[1].value)}
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
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={type === 'daily' ? 'date' : 'month'}
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke={themeColors.primary}
            strokeWidth={2}
            dot={{ fill: themeColors.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: themeColors.primary, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke={themeColors.dark}
            strokeWidth={2}
            dot={{ fill: themeColors.dark, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: themeColors.dark, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}