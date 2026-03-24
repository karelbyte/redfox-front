'use client'

import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { Sale, SaleStatus } from '@/types/sale';
import ActionsMenu from '@/components/atoms/ActionsMenu';
import { SaleActionsMenu } from './SaleActionsMenu';

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
  const { formatCurrency, formatDate } = useLocaleUtils();

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
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
                  {formatDate(sale.created_at, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
                  {formatCurrency(parseFloat(sale.amount))}
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
                  <ActionsMenu
                    items={SaleActionsMenu({
                      sale,
                      onDetails,
                      onEdit,
                      onDelete,
                      onClose,
                      onRefund,
                      onPrintTicket,
                      onInvoice,
                    })}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
