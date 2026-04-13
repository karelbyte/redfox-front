'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslations } from 'next-intl';

interface ShipmentStatusChartProps {
  data: Array<{ status: string; count: number }>;
  themeColors: { primary: string; light: string; dark: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#f59e0b',
  PACKING:   '#f97316',
  SHIPPED:   '#3b82f6',
  DELIVERED: '#22c55e',
  RETURNED:  '#ef4444',
  FAILED:    '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  PACKING:   'Empacando',
  SHIPPED:   'En camino',
  DELIVERED: 'Entregado',
  RETURNED:  'Devuelto',
  FAILED:    'Fallido',
};

export default function ShipmentStatusChart({ data, themeColors }: ShipmentStatusChartProps) {
  const t = useTranslations('pages.dashboard.analytics');

  const chartData = data.map((d) => ({ ...d, label: STATUS_LABELS[d.status] ?? d.status }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      const total = chartData.reduce((s, c) => s + c.count, 0);
      const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
      return (
        <div className="p-3 rounded-lg shadow-lg border text-sm" style={{ backgroundColor: 'white', borderColor: themeColors.light }}>
          <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
          <p className="text-gray-600">{t('count')}: <strong>{item.count}</strong> ({pct}%)</p>
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
            {chartData.map((item, i) => <Cell key={i} fill={STATUS_COLORS[item.status] ?? '#64748b'} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={48} iconType="circle" iconSize={8}
            formatter={(_, entry: any) => <span style={{ color: '#374151', fontSize: '11px' }}>{entry?.payload?.label}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
