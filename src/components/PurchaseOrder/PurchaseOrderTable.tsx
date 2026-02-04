'use client'

import { useTranslations, useLocale } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import { Btn } from '@/components/atoms';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrder: PurchaseOrder) => void;
  onDetails: (purchaseOrder: PurchaseOrder) => void;
  onApprove: (purchaseOrder: PurchaseOrder) => void;
  onReject: (purchaseOrder: PurchaseOrder) => void;
  onCancel: (purchaseOrder: PurchaseOrder) => void;
  onGeneratePDF: (purchaseOrder: PurchaseOrder) => void;
  visibleColumns?: string[];
}

export default function PurchaseOrderTable({ 
  purchaseOrders, 
  onEdit, 
  onDelete, 
  onDetails, 
  onApprove, 
  onReject, 
  onCancel,
  onGeneratePDF,
  visibleColumns 
}: PurchaseOrderTableProps) {
  const t = useTranslations('pages.purchaseOrders');
  const locale = useLocale();

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('status.pending');
      case 'APPROVED':
        return t('status.approved');
      case 'REJECTED':
        return t('status.rejected');
      case 'CANCELLED':
        return t('status.cancelled');
      case 'COMPLETED':
        return t('status.completed');
      default:
        return status;
    }
  };

  const canEdit = (status: string) => {
    return status === 'PENDING';
  };

  const canDelete = (status: string) => {
    return status === 'PENDING';
  };

  const canApprove = (status: string) => {
    return status === 'PENDING';
  };

  const canReject = (status: string) => {
    return status === 'PENDING';
  };

  const canCancel = (status: string) => {
    return status === 'PENDING' || status === 'APPROVED';
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
            {isVisible('provider') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.provider')}
              </th>
            )}
            {isVisible('warehouse') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.warehouse')}
              </th>
            )}
            {isVisible('document') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.document')}
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
          {purchaseOrders.map((purchaseOrder) => (
            <tr key={purchaseOrder.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {purchaseOrder.code}
                </td>
              )}
              {isVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(purchaseOrder.date)}
                </td>
              )}
              {isVisible('provider') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchaseOrder.provider.name}
                </td>
              )}
              {isVisible('warehouse') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchaseOrder.warehouse.name}
                </td>
              )}
              {isVisible('document') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchaseOrder.document}
                </td>
              )}
              {isVisible('amount') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(purchaseOrder.amount)}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}
                  >
                    {getStatusText(purchaseOrder.status)}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDetails(purchaseOrder)}
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onGeneratePDF(purchaseOrder)}
                      leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                      title={t('actions.generatePDF')}
                    />
                    {canApprove(purchaseOrder.status) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(purchaseOrder)}
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        title={t('actions.approve')}
                        style={{ color: '#059669' }}
                      />
                    )}
                    {canReject(purchaseOrder.status) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(purchaseOrder)}
                        leftIcon={<XCircleIcon className="h-4 w-4" />}
                        title={t('actions.reject')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                    {canCancel(purchaseOrder.status) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(purchaseOrder)}
                        leftIcon={<XMarkIcon className="h-4 w-4" />}
                        title={t('actions.cancel')}
                        style={{ color: '#f59e0b' }}
                      />
                    )}
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(purchaseOrder)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={canEdit(purchaseOrder.status) ? t('actions.edit') : t(`actions.cannotEdit${purchaseOrder.status.charAt(0) + purchaseOrder.status.slice(1).toLowerCase()}`)}
                      disabled={!canEdit(purchaseOrder.status)}
                      className={!canEdit(purchaseOrder.status) ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(purchaseOrder)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={canDelete(purchaseOrder.status) ? t('actions.delete') : t(`actions.cannotDelete${purchaseOrder.status.charAt(0) + purchaseOrder.status.slice(1).toLowerCase()}`)}
                      disabled={!canDelete(purchaseOrder.status)}
                      className={!canDelete(purchaseOrder.status) ? 'opacity-50 cursor-not-allowed' : ''}
                      style={{ color: canDelete(purchaseOrder.status) ? '#dc2626' : '#9ca3af' }}
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