'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface PaymentMethodChartProps {
  data: Array<{ method: string; count: number; revenue: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

const COLORS = ['#6366f1', '#22c55e', '#f97316'];

const METHOD_LABELS: Record<string, Record<string, string>> = {
  cash:   { es: 'Efectivo',  en: 'Cash',   zh: '现金' },
  card:   { es: 'Tarjeta',   en: 'Card',   zh: '刷卡' },
  credit: { es: 'Crédito',   en: 'Credit', zh: '赊账' },
};

export default function PaymentMethodChart({ data, themeColors }: PaymentMethodChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const chartData = data.map((d) => ({
    ...d,
    label: METHOD_LABELS[d.method]?.es ?? d.method,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
          <p className="text-gray-600">{t('sales')}: <strong>{item.count}</strong></p>
          <p className="text-gray-600">{t('revenue')}: <strong>{formatCurrency(item.revenue)}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="45%" outerRadius={85} dataKey="count" nameKey="label" labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
              if (percent < 0.06) return null;
              const RADIAN = Math.PI / 180;
              const r = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + r * Math.cos(-midAngle * RADIAN);
              const y = cy + r * Math.sin(-midAngle * RADIAN);
              return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
            }}
          >
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
            formatter={(_, entry: any) => <span style={{ color: '#374151', fontSize: '11px' }}>{entry?.payload?.label}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
