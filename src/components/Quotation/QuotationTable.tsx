'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { Quotation, QuotationStatus } from '@/types/quotation';
import { toastService } from '@/services/toast.service';
import { quotationService } from '@/services/quotations.service';
import { Btn } from '@/components/atoms';
import { EyeIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/components/Modal/ConfirmModal';
import { QuotationPDFService } from '@/services/quotation-pdf.service';

interface QuotationTableProps {
  quotations: Quotation[];
  onEdit: (quotation: Quotation) => void;
  onView: (quotation: Quotation) => void;
  onRefresh: () => void;
  visibleColumns: string[];
  onGeneratePDF?: (quotation: Quotation) => void;
}

const QuotationTable = ({ quotations, onEdit, onView, onRefresh, visibleColumns, onGeneratePDF }: QuotationTableProps) => {
  const t = useTranslations('pages.quotations');
  const tCommon = useTranslations('common');
  const { formatDate, formatCurrency } = useLocaleUtils();
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const handleGeneratePDF = (quotation: Quotation) => {
    if (onGeneratePDF) {
      onGeneratePDF(quotation);
    }
  };

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

  const handleDeleteClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setDeleteModalOpen(true);
  };

  const handleConvertClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setConvertModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuotation) return;

    try {
      setLoadingActions(prev => ({ ...prev, [`delete-${selectedQuotation.id}`]: true }));
      await quotationService.deleteQuotation(selectedQuotation.id);
      toastService.success(t('messages.deleteSuccess'));
      setDeleteModalOpen(false);
      setSelectedQuotation(null);
      onRefresh();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${selectedQuotation.id}`]: false }));
    }
  };

  const handleConvertConfirm = async () => {
    if (!selectedQuotation) return;

    try {
      setLoadingActions(prev => ({ ...prev, [`convert-${selectedQuotation.id}`]: true }));
      const result = await quotationService.convertToSale(selectedQuotation.id);
      toastService.success(result.message);
      setConvertModalOpen(false);
      setSelectedQuotation(null);
      onRefresh();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorConverting'));
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, [`convert-${selectedQuotation.id}`]: false }));
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
    <>
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{
          boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
        }}
      >
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
            <tr key={quotation.id} className="hover:bg-primary-50 transition-colors">
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
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(quotation)}
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.view')}
                    />

                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGeneratePDF(quotation)}
                      leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                      title={t('actions.downloadPDF')}
                      style={{ color: '#059669' }}
                    />

                    {quotation.status !== QuotationStatus.CONVERTED && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(quotation)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={tCommon('actions.edit')}
                      />
                    )}

                    {canConvertToSale(quotation) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConvertClick(quotation)}
                        leftIcon={<ArrowsRightLeftIcon className="h-4 w-4" />}
                        loading={loadingActions[`convert-${quotation.id}`]}
                        title={t('actions.convertToSale')}
                        style={{ color: '#059669' }}
                      />
                    )}

                    {quotation.status !== QuotationStatus.CONVERTED && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(quotation)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        loading={loadingActions[`delete-${quotation.id}`]}
                        title={tCommon('actions.delete')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={deleteModalOpen}
      onClose={() => {
        setDeleteModalOpen(false);
        setSelectedQuotation(null);
      }}
      onConfirm={handleDeleteConfirm}
      title={t('messages.confirmDeleteTitle')}
      message={t('messages.confirmDelete', { code: selectedQuotation?.code || '' })}
      confirmText={tCommon('actions.delete')}
      cancelText={tCommon('actions.cancel')}
      confirmButtonStyle={{ backgroundColor: '#dc2626' }}
    />

    {/* Convert to Sale Confirmation Modal */}
    <ConfirmModal
      isOpen={convertModalOpen}
      onClose={() => {
        setConvertModalOpen(false);
        setSelectedQuotation(null);
      }}
      onConfirm={handleConvertConfirm}
      title={t('messages.confirmConvertTitle')}
      message={t('messages.confirmConvertToSale', { code: selectedQuotation?.code || '' })}
      confirmText={t('actions.convertToSale')}
      cancelText={tCommon('actions.cancel')}
      confirmButtonStyle={{ backgroundColor: '#059669' }}
    />
  </>
  );
};

export default QuotationTable;