"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Invoice, InvoicePayment, InvoicePaymentStatus, PaymentMethod } from '@/types/invoice';
import { invoiceService } from '@/services';
import { toastService } from '@/services/toast.service';
import Loading from "@/components/Loading/Loading";
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useLocaleUtils } from '@/hooks/useLocale';
import PaymentComplementModal from '@/components/Invoice/PaymentComplementModal';
import CancelPaymentComplementModal from '@/components/Invoice/CancelPaymentComplementModal';
import { InvoicePDFButton, InvoiceXMLButton } from '@/components/Invoice/InvoiceDownloadButtons';

export default function InvoiceDetailsPage() {
  const t = useTranslations('pages.invoices');
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { formatCurrency, formatDate } = useLocaleUtils();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registeringPayment, setRegisteringPayment] = useState(false);
  const [cancellingPaymentId, setCancellingPaymentId] = useState<string | null>(null);
  const [paymentToCancel, setPaymentToCancel] = useState<InvoicePayment | null>(null);

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceDetails();
    }
  }, [invoiceId]);

  const canDownload = (status: string) => status === 'stamped';

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const invoiceResponse = await invoiceService.getInvoiceById(invoiceId);
      setInvoice(invoiceResponse);
      if (invoiceResponse.cfdi_uuid && invoiceResponse.payment_method === PaymentMethod.CREDIT) {
        const paymentsResponse = await invoiceService.getInvoicePayments(invoiceId);
        setPayments(paymentsResponse);
      }
    } catch (error) {
      console.error('Error loading invoice details:', error);
      toastService.error(t('errors.loadInvoiceDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (data: { amount: number; payment_date: string; payment_form: string; notes?: string }) => {
    try {
      setRegisteringPayment(true);
      await invoiceService.registerPayment(invoiceId, data);
      toastService.success(t('payments.success'));
      setShowPaymentModal(false);
      await loadInvoiceDetails();
    } catch (error: any) {
      toastService.error(error?.message || t('payments.error'));
    } finally {
      setRegisteringPayment(false);
    }
  };

  const handleCancelPayment = async (paymentId: string, reason: string) => {
    try {
      setCancellingPaymentId(paymentId);
      await invoiceService.cancelPayment(invoiceId, paymentId, reason);
      toastService.success(t('payments.cancelSuccess'));
      setPaymentToCancel(null);
      await loadInvoiceDetails();
    } catch (error: any) {
      toastService.error(error?.message || t('payments.cancelError'));
    } finally {
      setCancellingPaymentId(null);
    }
  };

  const invoiceCurrency = invoice?.details?.[0]?.product?.currency?.code || 'MXN';

  const fmt = (amount: number) => formatCurrency(amount, invoiceCurrency);

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
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('details.notFound')}
          </h2>
          <Btn
            onClick={() => router.push('/es/dashboard/facturas')}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push('/es/dashboard/facturas')}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('details.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('details.subtitle', { code: invoice.code })}
            </p>
          </div>
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
                  {invoice.details.map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fmt(detail.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fmt(detail.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fmt(detail.tax_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fmt(detail.total)}
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
                <span className="text-sm font-medium text-gray-900">{fmt(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{t('details.tax')}</span>
                <span className="text-sm font-medium text-gray-900">{fmt(invoice.tax_amount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">{t('details.total')}</span>
                  <span className="text-base font-bold text-gray-900">{fmt(invoice.total_amount)}</span>
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

      {/* Complementos de Pago — ancho completo, solo para facturas PPD timbradas */}
      {invoice.cfdi_uuid && invoice.payment_method === PaymentMethod.CREDIT && (
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          style={{ boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` }}
        >
          {/* Header con botón y barra de progreso */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('payments.title')}</h3>
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <Btn size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowPaymentModal(true)}>
                {t('payments.register')}
              </Btn>
            )}
          </div>

          {(() => {
            const totalPaid = payments.filter(p => p.status !== InvoicePaymentStatus.CANCELLED).reduce((s, p) => s + Number(p.amount), 0);
            const pct = Math.min(100, Math.round((totalPaid / invoice.total_amount) * 100));
            return (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t('payments.paid')}: {fmt(totalPaid)}</span>
                  <span>{t('payments.remaining')}: {fmt(invoice.total_amount - totalPaid)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: `rgb(var(--color-primary-500))` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{pct}% {t('payments.completed')}</p>
              </div>
            );
          })()}

          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{t('payments.noPayments')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.amount')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.paymentForm')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CFDI Complemento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payments.statusLabel')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.payment_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.payment_date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{fmt(Number(payment.amount))}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.payment_form}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{payment.cfdi_complement_uuid || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${payment.status === InvoicePaymentStatus.STAMPED ? 'bg-green-100 text-green-700'
                            : payment.status === InvoicePaymentStatus.CANCELLED ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {payment.status === InvoicePaymentStatus.STAMPED
                            ? <CheckCircleIcon className="h-3 w-3" />
                            : payment.status === InvoicePaymentStatus.CANCELLED
                              ? <XCircleIcon className="h-3 w-3" />
                              : <ClockIcon className="h-3 w-3" />}
                          {t(`payments.status.${payment.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {canDownload(payment.status) && (
                          <>
                            <InvoicePDFButton
                              invoiceId={payment.id}
                              invoiceCode={invoice.code + '-P' + payment.payment_number}
                            />
                            <InvoiceXMLButton
                              invoiceId={payment.id}
                              invoiceCode={invoice.code + '-P' + payment.payment_number}
                            />
                          </>
                        )}
                        {payment.status === InvoicePaymentStatus.STAMPED && invoice.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setPaymentToCancel(payment)}
                            disabled={cancellingPaymentId === payment.id}
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center gap-1"
                            title={t('payments.cancelComplement')}
                          >
                            {cancellingPaymentId === payment.id
                              ? <ClockIcon className="h-3 w-3 animate-spin" />
                              : <XCircleIcon className="h-3 w-3" />}
                            {t('payments.cancel')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showPaymentModal && invoice && (
        <PaymentComplementModal
          invoice={invoice}
          payments={payments}
          loading={registeringPayment}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleRegisterPayment}
        />
      )}

      <CancelPaymentComplementModal
        payment={paymentToCancel}
        loading={cancellingPaymentId !== null}
        onClose={() => setPaymentToCancel(null)}
        onConfirm={handleCancelPayment}
      />
    </div>
  );
}