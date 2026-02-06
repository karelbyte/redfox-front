"use client";

import { useTranslations } from 'next-intl';
import { CashFlowMovement } from '@/types/cash-flow';

interface CashFlowTableProps {
  movements: CashFlowMovement[];
  isLoading?: boolean;
}

export default function CashFlowTable({ movements, isLoading }: CashFlowTableProps) {
  const t = useTranslations('cashFlow');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'receivable':
        return 'bg-blue-100 text-blue-800';
      case 'payable':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return t(`movements.type.${type}`);
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.date')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.type')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.description')}
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.amount')}
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.balance')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements && movements.length > 0 ? movements.map((movement, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(movement.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                  {getTypeLabel(movement.type)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {movement.description}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getAmountColor(movement.amount)}`}>
                {formatCurrency(movement.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                {formatCurrency(movement.balance)}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                {t('empty.noMovements')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
