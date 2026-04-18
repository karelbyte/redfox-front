import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { useTranslations } from 'next-intl';

interface ProductProfitabilityChartProps {
  data: Array<{
    productName: string;
    unitsSold: number;
    profitMargin: number;
    totalRevenue: number;
  }>;
}

export const ProductProfitabilityChart: React.FC<ProductProfitabilityChartProps> = ({ data }) => {
  const t = useTranslations('pages.dashboard.analytics');

  const chartData = data.map(item => ({
    x: item.unitsSold,
    y: item.profitMargin,
    z: item.totalRevenue,
    name: item.productName
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{t('unitsSold')}: {data.x}</p>
          <p>{t('profitMargin')}: {(data.y * 100).toFixed(1)}%</p>
          <p>{t('totalRevenue')}: ${data.z.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 ">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('productProfitability')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={t('unitsSold')}
            label={{ value: t('unitsSold'), position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={t('profitMargin')}
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: t('profitMargin'), angle: -90, position: 'insideLeft' }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[50, 400]}
            name={t('totalRevenue')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name={t('productProfitability')}
            data={chartData}
            fill="#10B981"
          />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        {t('profitabilityDisclaimer')}
      </p>
    </div>
  );
};