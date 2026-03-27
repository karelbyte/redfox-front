'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { InvoicePayment } from '@/types/invoice';
import { useLocaleUtils } from '@/hooks/useLocale';

// Motivos de cancelación SAT para complementos de pago
const CANCEL_REASONS = [
  { k: '01', label: 'Comprobante emitido con errores con relación' },
  { k: '02', label: 'Comprobante emitido con errores sin relación' },
  { k: '03', label: 'No se llevó a cabo la operación' },
  { k: '04', label: 'Operación nominativa relacionada en la factura global' },
];

interface CancelPaymentComplementModalProps {
  payment: InvoicePayment | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (paymentId: string, reason: string) => void;
}

export default function CancelPaymentComplementModal({
  payment,
  loading,
  onClose,
  onConfirm,
}: CancelPaymentComplementModalProps) {
  const t = useTranslations('pages.invoices');
  const { formatCurrency, formatDate } = useLocaleUtils();
  const [reason, setReason] = useState('01');

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">{t('payments.cancelComplementTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('payments.cancelComplementMessage')}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Resumen del complemento */}
          <div className="mb-5 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.installment')} #</span>
              <span className="font-medium">{payment.payment_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.amount')}</span>
              <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.date')}</span>
              <span className="font-medium">{formatDate(payment.payment_date)}</span>
            </div>
            {payment.cfdi_complement_uuid && (
              <div className="flex justify-between">
                <span className="text-gray-500">CFDI</span>
                <span className="font-mono text-xs text-gray-600 truncate max-w-[200px]">{payment.cfdi_complement_uuid}</span>
              </div>
            )}
          </div>

          {/* Motivo de cancelación SAT */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payments.cancelReason')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': `rgb(var(--color-primary-500))` } as React.CSSProperties}
              disabled={loading}
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r.k} value={r.k}>{r.k} — {r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Btn variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              {t('payments.cancel')}
            </Btn>
            <Btn
              onClick={() => onConfirm(payment.id, reason)}
              loading={loading}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {loading ? t('payments.cancelling') : t('payments.confirmCancel')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
