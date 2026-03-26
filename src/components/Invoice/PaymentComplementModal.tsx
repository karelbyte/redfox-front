'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Btn, Input } from '@/components/atoms';
import { Invoice, InvoicePayment, InvoicePaymentStatus } from '@/types/invoice';
import { useLocaleUtils } from '@/hooks/useLocale';

interface PaymentComplementModalProps {
  invoice: Invoice;
  payments: InvoicePayment[];
  loading: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: number; payment_date: string; payment_form: string; notes?: string }) => void;
}

const PAYMENT_FORMS = [
  { k: '01', label: 'Efectivo' },
  { k: '02', label: 'Cheque nominativo' },
  { k: '03', label: 'Transferencia electrónica' },
  { k: '04', label: 'Tarjeta de crédito' },
  { k: '28', label: 'Tarjeta de débito' },
  { k: '29', label: 'Tarjeta de servicios' },
];

export default function PaymentComplementModal({
  invoice,
  payments,
  loading,
  onClose,
  onConfirm,
}: PaymentComplementModalProps) {
  const t = useTranslations('pages.invoices');
  const { formatCurrency } = useLocaleUtils();

  const totalPaid = payments
    .filter(p => p.status !== InvoicePaymentStatus.CANCELLED)
    .reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.round((Number(invoice.total_amount) - totalPaid) * 100) / 100;
  const nextPaymentNumber = payments.filter(p => p.status !== InvoicePaymentStatus.CANCELLED).length + 1;

  const today = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState<string>(remaining.toFixed(2));
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentForm, setPaymentForm] = useState('03');
  const [notes, setNotes] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const balanceAfter = Math.round((remaining - amountNum) * 100) / 100;
  const isValid = amountNum > 0 && amountNum <= remaining && paymentDate && paymentForm;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({ amount: amountNum, payment_date: paymentDate, payment_form: paymentForm, notes: notes || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">{t('payments.modalTitle')}</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Resumen */}
          <div className="mb-5 p-3 bg-gray-50 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.installment')} #</span>
              <span className="font-medium">{nextPaymentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.remaining')}</span>
              <span className="font-medium">{formatCurrency(remaining)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payments.balanceAfter')}</span>
              <span className={`font-medium ${balanceAfter === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatCurrency(balanceAfter < 0 ? 0 : balanceAfter)}
                {balanceAfter === 0 && <span className="ml-1 text-xs">✓ {t('payments.fullPayment')}</span>}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label={t('payments.amount')}
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              max={remaining}
              step="0.01"
              required
              error={amountNum > remaining ? t('payments.exceedsBalance') : undefined}
            />

            <Input
              label={t('payments.date')}
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.paymentForm')}</label>
              <select
                value={paymentForm}
                onChange={e => setPaymentForm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': `rgb(var(--color-primary-500))` } as React.CSSProperties}
              >
                {PAYMENT_FORMS.map(f => (
                  <option key={f.k} value={f.k}>{f.k} — {f.label}</option>
                ))}
              </select>
            </div>

            <Input
              label={t('payments.notes')}
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('payments.notesPlaceholder')}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Btn variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              {t('payments.cancel')}
            </Btn>
            <Btn onClick={handleConfirm} loading={loading} disabled={!isValid || loading} className="flex-1">
              {loading ? t('payments.stamping') : t('payments.confirm')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
