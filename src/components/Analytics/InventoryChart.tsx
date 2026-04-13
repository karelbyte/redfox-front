'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';

interface InventoryChartProps {
  data: Array<{
    categoryName: string;
    count: number;
    value: number;
  }>;
  themeColors: {
    primary: string;
    light: string;
    dark: string;
  };
}

const COLORS = [
  '#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6',
  '#f59e0b', '#3b82f6', '#a855f7', '#64748b',
];

const MAX_SLICES = 8;

export default function InventoryChart({ data, themeColors }: InventoryChartProps) {
  const t = useTranslations('pages.dashboard.analytics');
  const { formatCurrency } = useLocaleUtils();

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);

  const chartData = rest.length > 0
    ? [...top, { categoryName: 'Otras', count: rest.reduce((s, c) => s + c.count, 0), value: rest.reduce((s, c) => s + c.value, 0) }]
    : top;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const total = chartData.reduce((s, c) => s + c.count, 0);
      const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
      return (
        <div
          className="p-3 rounded-lg shadow-lg border text-sm"
          style={{ backgroundColor: 'white', borderColor: themeColors.light }}
        >
          <p className="font-semibold text-gray-900 mb-1">{item.categoryName}</p>
          <p className="text-gray-600">{t('products')}: <strong>{item.count}</strong> ({pct}%)</p>
          <p className="text-gray-600">{t('value')}: <strong>{formatCurrency(item.value)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={<CustomLabel />}
            outerRadius={85}
            dataKey="count"
            nameKey="categoryName"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            iconSize={8}
            formatter={(value, entry: any) => (
              <span style={{ color: '#374151', fontSize: '11px' }}>
                {entry?.payload?.categoryName || value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
