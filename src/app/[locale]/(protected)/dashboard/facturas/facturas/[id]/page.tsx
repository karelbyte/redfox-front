"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Invoice, InvoiceDetail } from '@/types/invoice';
import { invoiceService } from '@/services';
import { toastService } from '@/services/toast.service';
import Loading from "@/components/Loading/Loading";

export default function InvoiceDetailsPage() {
  const t = useTranslations('pages.invoices');
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [details, setDetails] = useState<InvoiceDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceDetails();
    }
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const [invoiceResponse, detailsResponse] = await Promise.all([
        invoiceService.getInvoiceById(invoiceId),
        invoiceService.getInvoiceDetails(invoiceId)
      ]);
      
      setInvoice(invoiceResponse);
      setDetails(detailsResponse.data);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      toastService.error(t('errors.loadInvoiceDetails'));
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <Loading size="lg" />;
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('details.notFound')}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('details.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('details.subtitle', { code: invoice.code })}</p>
        </div>
        <span
          className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}
        >
          {getStatusText(invoice.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            style={{ 
              boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
            }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('details.invoiceInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('details.code')}</label>
                <p className="mt-1 text-sm text-gray-900">{invoice.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('details.date')}</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('details.client')}</label>
                <p className="mt-1 text-sm text-gray-900">{invoice.client.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('details.paymentMethod')}</label>
                <p className="mt-1 text-sm text-gray-900">{invoice.payment_method}</p>
              </div>
            </div>
            {invoice.payment_conditions && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">{t('details.paymentConditions')}</label>
                <p className="mt-1 text-sm text-gray-900">{invoice.payment_conditions}</p>
              </div>
            )}
            {invoice.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">{t('details.notes')}</label>
                <p className="mt-1 text-sm text-gray-900">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            style={{ 
              boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
            }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('details.products')}</h3>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.subtotal')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.tax')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('details.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {details.map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.tax_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(detail.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            style={{ 
              boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
            }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('details.summary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('details.subtotal')}</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('details.tax')}</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">{t('details.total')}</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.cfdi_uuid && (
            <div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              style={{ 
                boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
              }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('details.cfdi')}</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('details.uuid')}</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{invoice.cfdi_uuid}</p>
                </div>
                {invoice.pack_invoice_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">{t('details.packInvoiceId')}</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{invoice.pack_invoice_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
