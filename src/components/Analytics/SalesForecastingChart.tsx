import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';

interface SalesForecastingChartProps {
  data: {
    historicalSales: Array<{ month: string; sales: number; revenue: number }>;
    forecast: Array<{ month: string; predictedSales: number; confidence: number }>;
  };
}

export const SalesForecastingChart: React.FC<SalesForecastingChartProps> = ({ data }) => {
  const t = useTranslations('pages.dashboard.analytics');

  // Combine historical and forecast data
  const chartData = [
    ...data.historicalSales.map(item => ({
      month: item.month,
      actual: item.sales,
      predicted: null,
      type: 'historical'
    })),
    ...data.forecast.map(item => ({
      month: item.month,
      actual: null,
      predicted: item.predictedSales,
      type: 'forecast'
    }))
  ];

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{formatMonth(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'actual' ? t('actual') : t('forecast')}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('salesForecasting')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3B82F6"
            strokeWidth={2}
            name={t('actual')}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            name={t('forecast')}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        {t('forecastDisclaimer')}
      </p>
    </div>
  );
};