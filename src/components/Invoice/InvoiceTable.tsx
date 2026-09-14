import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { Invoice } from '@/types/invoice';
import ActionsMenu from '@/components/atoms/ActionsMenu';
import { InvoiceActionsMenu } from './InvoiceActionsMenu';
import { InvoicePDFButton, InvoiceXMLButton } from './InvoiceDownloadButtons';
import { usePackCapabilities } from '@/hooks/usePackCapabilities';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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
  const { formatCurrency } = useLocaleUtils();
  
  if (!Array.isArray(invoices)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getInvoiceCurrency = (invoice: Invoice) =>
    invoice.details?.[0]?.product?.currency?.code || 'MXN';

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

  const { capabilities } = usePackCapabilities();

  const canEdit = (status: string) => status === 'DRAFT';
  const canDelete = (status: string) => status === 'DRAFT';
  const canGenerateCFDI = (status: string) => status === 'DRAFT';
  const canCancelCFDI = (status: string) => status === 'SENT' || status === 'PAID';
  const isIssued = (status: string) => status === 'SENT' || status === 'PAID' || status === 'CANCELLED';
  // Los PAC que no sirven los archivos por la API (SUNAT) devuelven las URLs
  // del PDF y el XML dentro de la respuesta del comprobante.
  const canDownload = (status: string) => isIssued(status) && capabilities.documentDownload;

  const packDocumentUrl = (invoice: Invoice, key: 'pdf_url' | 'xml_url'): string | null => {
    const value = invoice.pack_invoice_response?.[key];
    return typeof value === 'string' && value ? value : null;
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.code}
                  {invoice.series && invoice.number != null && (
                    <span className="block text-xs text-gray-500 font-mono">
                      {invoice.series}-{String(invoice.number).padStart(8, '0')}
                    </span>
                  )}
                </td>
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
                  {formatCurrency(invoice.subtotal, getInvoiceCurrency(invoice))}
                </td>
              )}
              {visibleColumns.includes('tax') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.tax_amount, getInvoiceCurrency(invoice))}
                </td>
              )}
              {visibleColumns.includes('total') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.total_amount, getInvoiceCurrency(invoice))}
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
                  <div className="flex justify-end items-center gap-2">
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
                    {!capabilities.documentDownload &&
                      isIssued(invoice.status) &&
                      (['pdf_url', 'xml_url'] as const).map((key) => {
                        const url = packDocumentUrl(invoice, key);

                        return url ? (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={key === 'pdf_url' ? 'PDF' : 'XML'}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                          >
                            {key === 'pdf_url' ? 'PDF' : 'XML'}
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </a>
                        ) : null;
                      })}
                    <ActionsMenu
                      items={InvoiceActionsMenu({
                        invoice,
                        onEdit,
                        onDelete,
                        onDetails,
                        onGenerateCFDI,
                        onCancelCFDI,
                        capabilities,
                      })}
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
