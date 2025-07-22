'use client'

import { useTranslations } from 'next-intl';
import { Sale } from '@/types/sale';
import { Btn } from '@/components/atoms';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface SaleTableProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onDetails: (sale: Sale) => void;
  onClose: (sale: Sale) => void;
  onGeneratePDF: (sale: Sale) => void;
}

export default function SaleTable({ sales, onEdit, onDelete, onDetails, onClose, onGeneratePDF }: SaleTableProps) {
  const t = useTranslations('pages.sales');

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden"
      style={{ 
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.code')}
            </th>
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
              {t('table.destination')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.client')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.amount')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.status')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {sale.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(sale.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sale.destination}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sale.client.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(sale.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sale.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {sale.status ? t('status.completed') : t('status.pending')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDetails(sale)}
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewDetails')}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onGeneratePDF(sale)}
                    leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                    title={t('actions.generatePDF')}
                  />
                  {!sale.status && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onClose(sale)}
                      leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                      title={t('actions.closeSale')}
                      style={{ color: '#dc2626' }}
                    />
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(sale)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={sale.status ? t('actions.cannotEditCompleted') : t('actions.edit')}
                    disabled={sale.status}
                    className={sale.status ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(sale)}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={sale.status ? t('actions.cannotDeleteCompleted') : t('actions.delete')}
                    disabled={sale.status}
                    className={sale.status ? 'opacity-50 cursor-not-allowed' : ''}
                    style={{ color: sale.status ? '#9ca3af' : '#dc2626' }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 