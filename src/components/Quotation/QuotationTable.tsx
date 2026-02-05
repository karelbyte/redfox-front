'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { Quotation, QuotationStatus } from '@/types/quotation';
import { toastService } from '@/services/toast.service';
import { quotationService } from '@/services/quotations.service';

interface QuotationTableProps {
  quotations: Quotation[];
  onEdit: (quotation: Quotation) => void;
  onView: (quotation: Quotation) => void;
  onRefresh: () => void;
  visibleColumns: string[];
}

const QuotationTable = ({ quotations, onEdit, onView, onRefresh, visibleColumns }: QuotationTableProps) => {
  const t = useTranslations('pages.quotations');
  const { formatDate, formatCurrency } = useLocaleUtils();
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

  const getStatusBadge = (status: QuotationStatus) => {
    const statusConfig = {
      [QuotationStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', text: t('status.draft') },
      [QuotationStatus.SENT]: { color: 'bg-blue-100 text-blue-800', text: t('status.sent') },
      [QuotationStatus.ACCEPTED]: { color: 'bg-green-100 text-green-800', text: t('status.accepted') },
      [QuotationStatus.REJECTED]: { color: 'bg-red-100 text-red-800', text: t('status.rejected') },
      [QuotationStatus.EXPIRED]: { color: 'bg-yellow-100 text-yellow-800', text: t('status.expired') },
      [QuotationStatus.CONVERTED]: { color: 'bg-purple-100 text-purple-800', text: t('status.converted') },
    };

    const config = statusConfig[status] || statusConfig[QuotationStatus.DRAFT];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleDelete = async (quotation: Quotation) => {
    if (!confirm(t('messages.confirmDelete', { code: quotation.code }))) {
      return;
    }

    try {
      setLoadingActions(prev => ({ ...prev, [`delete-${quotation.id}`]: true }));
      await quotationService.deleteQuotation(quotation.id);
      toastService.success(t('messages.deleteSuccess'));
      onRefresh();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${quotation.id}`]: false }));
    }
  };

  const handleConvertToSale = async (quotation: Quotation) => {
    if (!confirm(t('messages.confirmConvertToSale', { code: quotation.code }))) {
      return;
    }

    try {
      setLoadingActions(prev => ({ ...prev, [`convert-${quotation.id}`]: true }));
      const result = await quotationService.convertToSale(quotation.id);
      toastService.success(result.message);
      onRefresh();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorConverting'));
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [`convert-${quotation.id}`]: false }));
    }
  };

  const canConvertToSale = (quotation: Quotation) => {
    return quotation.status !== QuotationStatus.CONVERTED && 
           quotation.status !== QuotationStatus.REJECTED &&
           quotation.status !== QuotationStatus.EXPIRED;
  };

  const isColumnVisible = (column: string) => visibleColumns.includes(column);

  if (quotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noQuotations')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isColumnVisible('code') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.code')}
              </th>
            )}
            {isColumnVisible('date') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.date')}
              </th>
            )}
            {isColumnVisible('validUntil') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.validUntil')}
              </th>
            )}
            {isColumnVisible('client') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.client')}
              </th>
            )}
            {isColumnVisible('warehouse') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.warehouse')}
              </th>
            )}
            {isColumnVisible('total') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.total')}
              </th>
            )}
            {isColumnVisible('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.status')}
              </th>
            )}
            {isColumnVisible('actions') && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotations.map((quotation) => (
            <tr key={quotation.id} className="hover:bg-gray-50">
              {isColumnVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quotation.code}
                </td>
              )}
              {isColumnVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quotation.date)}
                </td>
              )}
              {isColumnVisible('validUntil') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quotation.valid_until ? formatDate(quotation.valid_until) : '-'}
                </td>
              )}
              {isColumnVisible('client') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{quotation.client.name}</div>
                    <div className="text-gray-500">{quotation.client.code}</div>
                  </div>
                </td>
              )}
              {isColumnVisible('warehouse') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quotation.warehouse.name}
                </td>
              )}
              {isColumnVisible('total') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(quotation.total)}
                </td>
              )}
              {isColumnVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(quotation.status)}
                </td>
              )}
              {isColumnVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(quotation)}
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: 'rgb(var(--color-primary-600))' }}
                      title={t('actions.view')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {quotation.status !== QuotationStatus.CONVERTED && (
                      <button
                        onClick={() => onEdit(quotation)}
                        className="hover:opacity-75 transition-opacity"
                        style={{ color: 'rgb(var(--color-primary-600))' }}
                        title={t('actions.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}

                    {canConvertToSale(quotation) && (
                      <button
                        onClick={() => handleConvertToSale(quotation)}
                        disabled={loadingActions[`convert-${quotation.id}`]}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
                        title={t('actions.convertToSale')}
                      >
                        {loadingActions[`convert-${quotation.id}`] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </button>
                    )}

                    {quotation.status !== QuotationStatus.CONVERTED && (
                      <button
                        onClick={() => handleDelete(quotation)}
                        disabled={loadingActions[`delete-${quotation.id}`]}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                        title={t('actions.delete')}
                      >
                        {loadingActions[`delete-${quotation.id}`] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationTable;