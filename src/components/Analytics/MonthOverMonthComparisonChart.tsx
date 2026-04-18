import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTranslations } from 'next-intl';

interface MonthOverMonthComparisonChartProps {
  data: {
    sales: Array<{ month: string; value: number; growth: number }>;
    revenue: Array<{ month: string; value: number; growth: number }>;
    orders: Array<{ month: string; value: number; growth: number }>;
    customers: Array<{ month: string; value: number; growth: number }>;
  };
}

type MetricType = 'sales' | 'revenue' | 'orders' | 'customers';

export const MonthOverMonthComparisonChart: React.FC<MonthOverMonthComparisonChartProps> = ({ data }) => {
  const t = useTranslations('pages.dashboard.analytics');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('sales');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const currentData = data?.[selectedMetric] ?? [];

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
  };

  const formatValue = (value: number): string => {
    switch (selectedMetric) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'sales':
      case 'orders':
      case 'customers':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{formatMonth(label)}</p>
          <p>{t(`metrics.${selectedMetric}`)}: {formatValue(data.value)}</p>
          <p className={data.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {t('metrics.growth')}: {data.growth >= 0 ? '+' : ''}{(data.growth * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const metrics = [
    { key: 'sales', label: t('metrics.sales') },
    { key: 'revenue', label: t('metrics.revenue') },
    { key: 'orders', label: t('metrics.orders') },
    { key: 'customers', label: t('metrics.customers') }
  ];

  const chartTypes = [
    { key: 'bar', label: t('chartTypes.bar') },
    { key: 'line', label: t('chartTypes.line') }
  ];

  return (
    <div className="bg-white p-6 ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('metrics.monthOverMonth')}
        </h3>
        <div className="flex gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {chartTypes.map(type => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
            />
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#3B82F6"
              name={t(`metrics.${selectedMetric}`)}
            />
          </BarChart>
        ) : (
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
            />
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              name={t(`metrics.${selectedMetric}`)}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentData.slice(-4).map((item, index) => (
          <div key={item.month} className="text-center">
            <p className="text-sm text-gray-600">{formatMonth(item.month)}</p>
            <p className="font-semibold">{formatValue(item.value)}</p>
            <p className={`text-sm ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.growth >= 0 ? '+' : ''}{(item.growth * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};