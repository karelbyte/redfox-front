import { useTranslations } from 'next-intl';
import { Invoice } from '@/types/invoice';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { InvoicePDFButton, InvoiceXMLButton } from './InvoiceDownloadButtons';
import { FileCheck2 } from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onDetails: (invoice: Invoice) => void;
  onGenerateCFDI: (invoice: Invoice) => void;
  onCancelCFDI: (invoice: Invoice) => void;
  visibleColumns?: string[];
}

export default function InvoiceTable({ 
  invoices, 
  onEdit, 
  onDelete, 
  onDetails, 
  onGenerateCFDI,
  onCancelCFDI,
  visibleColumns = ['code', 'date', 'client', 'subtotal', 'tax', 'total', 'status', 'actions']
}: InvoiceTableProps) {
  const t = useTranslations('pages.invoices');
  
  if (!Array.isArray(invoices)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return t('status.draft');
      case 'SENT':
        return t('status.sent');
      case 'PAID':
        return t('status.paid');
      case 'CANCELLED':
        return t('status.cancelled');
      default:
        return status;
    }
  };

  const canEdit = (status: string) => status === 'DRAFT';
  const canDelete = (status: string) => status === 'DRAFT';
  const canGenerateCFDI = (status: string) => status === 'DRAFT';
  const canCancelCFDI = (status: string) => status === 'SENT' || status === 'PAID';
  const canDownload = (status: string) => status === 'SENT' || status === 'PAID' || status === 'CANCELLED';

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
            {visibleColumns.includes('code') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {visibleColumns.includes('date') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.date')}
              </th>
            )}
            {visibleColumns.includes('client') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.client')}
              </th>
            )}
            {visibleColumns.includes('subtotal') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.subtotal')}
              </th>
            )}
            {visibleColumns.includes('tax') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.tax')}
              </th>
            )}
            {visibleColumns.includes('total') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.total')}
              </th>
            )}
            {visibleColumns.includes('status') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.status')}
              </th>
            )}
            {visibleColumns.includes('actions') && (
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
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-primary-50 transition-colors">
              {visibleColumns.includes('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.code}</td>
              )}
              {visibleColumns.includes('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.date)}
                </td>
              )}
              {visibleColumns.includes('client') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.client.name}
                </td>
              )}
              {visibleColumns.includes('subtotal') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.subtotal)}
                </td>
              )}
              {visibleColumns.includes('tax') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.tax_amount)}
                </td>
              )}
              {visibleColumns.includes('total') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.total_amount)}
                </td>
              )}
              {visibleColumns.includes('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </td>
              )}
              {visibleColumns.includes('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDetails(invoice)}
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />
                    
                    {canDownload(invoice.status) && (
                      <>
                        <InvoicePDFButton 
                          invoiceId={invoice.id} 
                          invoiceCode={invoice.code} 
                        />
                        <InvoiceXMLButton 
                          invoiceId={invoice.id} 
                          invoiceCode={invoice.code} 
                        />
                      </>
                    )}
                    
                    {canGenerateCFDI(invoice.status) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onGenerateCFDI(invoice)}
                        leftIcon={<FileCheck2 className="h-4 w-4" />}
                        title={t('actions.generateCFDI')}
                        style={{ color: '#059669' }}
                      />
                    )}
                    
                    {canCancelCFDI(invoice.status) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelCFDI(invoice)}
                        leftIcon={<XMarkIcon className="h-4 w-4" />}
                        title={t('actions.cancelCFDI')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                    
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={canEdit(invoice.status) ? t('actions.edit') : t('actions.cannotEdit')}
                      disabled={!canEdit(invoice.status)}
                      className={!canEdit(invoice.status) ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(invoice)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={canDelete(invoice.status) ? t('actions.delete') : t('actions.cannotDelete')}
                      disabled={!canDelete(invoice.status)}
                      className={!canDelete(invoice.status) ? 'opacity-50 cursor-not-allowed' : ''}
                      style={{ color: canDelete(invoice.status) ? '#dc2626' : '#9ca3af' }}
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
