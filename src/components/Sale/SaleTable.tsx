'use client'

import { useTranslations, useLocale } from 'next-intl';
import { Sale } from '@/types/sale';
import { Btn } from '@/components/atoms';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, DocumentTextIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { SaleStatus } from '@/types/sale';

interface SaleTableProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onDetails: (sale: Sale) => void;
  onClose: (sale: Sale) => void;
  onRefund: (sale: Sale) => void;
  onPrintTicket: (sale: Sale) => void;
  onInvoice?: (sale: Sale) => void;
  visibleColumns?: string[];
  hideClientColumn?: boolean;
}

export default function SaleTable({ sales, onEdit, onDelete, onDetails, onClose, onRefund, onPrintTicket, onInvoice, visibleColumns, hideClientColumn = false }: SaleTableProps) {
  const t = useTranslations('pages.sales');
  const locale = useLocale();

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
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
            {isVisible('code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {isVisible('date') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.date')}
              </th>
            )}
            {isVisible('destination') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.destination')}
              </th>
            )}
            {isVisible('client') && !hideClientColumn && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.client')}
              </th>
            )}
            {isVisible('amount') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.amount')}
              </th>
            )}
            {isVisible('status') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.status')}
              </th>
            )}
            {isVisible('fiscalStatus') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.fiscalStatus')}
              </th>
            )}
            {isVisible('actions') && (
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sale.code}
                </td>
              )}
              {isVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(sale.created_at)}
                </td>
              )}
              {isVisible('destination') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.destination}
                </td>
              )}
              {isVisible('client') && !hideClientColumn && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.client.name}
                </td>
              )}
              {isVisible('amount') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sale.amount)}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.status === SaleStatus.CLOSED
                        ? 'bg-green-100 text-green-800'
                        : sale.status === SaleStatus.RETURNED
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {sale.status === SaleStatus.CLOSED
                      ? t('status.completed')
                      : sale.status === SaleStatus.RETURNED
                        ? t('status.returned')
                        : t('status.pending')}
                  </span>
                </td>
              )}
              {isVisible('fiscalStatus') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.pack_fiscal_status ? (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.pack_fiscal_status === 'INVOICED_DIRECT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.pack_fiscal_status === 'INVOICED_GLOBAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {t(`fiscalStatus.${sale.pack_fiscal_status}`)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              )}
              {isVisible('actions') && (
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
                      onClick={() => onPrintTicket(sale)}
                      leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                      title={t('actions.printTicket')}
                    />
                    {sale.status === SaleStatus.CLOSED && onInvoice && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onInvoice(sale)}
                        leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                        title={t('actions.invoice')}
                        style={{ color: '#059669' }}
                      />
                    )}
                    {sale.status === SaleStatus.OPEN && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onClose(sale)}
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        title={t('actions.closeSale')}
                        style={{ color: '#059669' }}
                      />
                    )}
                    {sale.status === SaleStatus.CLOSED && !sale.pack_fiscal_status && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onRefund(sale)}
                        leftIcon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                        title={t('actions.refund')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                    {sale.status === SaleStatus.CLOSED && sale.pack_fiscal_status && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onRefund(sale)}
                        leftIcon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                        title={
                          sale.pack_fiscal_status === 'INVOICED_DIRECT' || sale.cfdi_uuid
                            ? t('actions.cannotRefundInvoiced')
                            : t('actions.refund')
                        }
                        disabled={sale.pack_fiscal_status === 'INVOICED_DIRECT' || !!sale.cfdi_uuid}
                        className={
                          sale.pack_fiscal_status === 'INVOICED_DIRECT' || sale.cfdi_uuid
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }
                        style={{ 
                          color: sale.pack_fiscal_status === 'INVOICED_DIRECT' || sale.cfdi_uuid 
                            ? '#9ca3af' 
                            : '#dc2626' 
                        }}
                      />
                    )}
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(sale)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={sale.status !== SaleStatus.OPEN ? t('actions.cannotEditCompleted') : t('actions.edit')}
                      disabled={sale.status !== SaleStatus.OPEN}
                      className={sale.status !== SaleStatus.OPEN ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(sale)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={sale.status !== SaleStatus.OPEN ? t('actions.cannotDeleteCompleted') : t('actions.delete')}
                      disabled={sale.status !== SaleStatus.OPEN}
                      className={sale.status !== SaleStatus.OPEN ? 'opacity-50 cursor-not-allowed' : ''}
                      style={{ color: sale.status !== SaleStatus.OPEN ? '#9ca3af' : '#dc2626' }}
                    />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 