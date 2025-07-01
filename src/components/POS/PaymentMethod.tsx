'use client'

import { useTranslations } from 'next-intl';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/atoms';

interface PaymentMethodProps {
  paymentMethod: 'cash' | 'card';
  cashAmount: number;
  total?: number;
  onPaymentMethodChange: (method: 'cash' | 'card') => void;
  onCashAmountChange: (amount: number) => void;
  getChange: () => number;
}

export default function PaymentMethod({
  paymentMethod,
  cashAmount,
  onPaymentMethodChange,
  onCashAmountChange,
  getChange
}: PaymentMethodProps) {
  const t = useTranslations('pages.pos');

  return (
    <>
      {/* Método de pago */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">{t('payment.title')}</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'cash')}
              className="text-primary-600"
            />
            <BanknotesIcon className="h-5 w-5" />
            <span>{t('payment.cash')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'card')}
              className="text-primary-600"
            />
            <CreditCardIcon className="h-5 w-5" />
            <span>{t('payment.card')}</span>
          </label>
        </div>
      </div>

      {/* Efectivo recibido */}
      {paymentMethod === 'cash' && (
        <div className="mb-6">
          <Input
            label={t('payment.cashReceived')}
            type="number"
            value={cashAmount}
            onChange={(e) => onCashAmountChange(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          {cashAmount > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">{t('payment.change')}: </span>
              <span className={`font-semibold ${getChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${getChange().toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
} 