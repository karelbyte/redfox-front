'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import { BanknotesIcon, CreditCardIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Input, Btn } from '@/components/atoms';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: 'cash' | 'card';
  cashAmount: number;
  total: number;
  loading: boolean;
  onPaymentMethodChange: (method: 'cash' | 'card') => void;
  onCashAmountChange: (amount: number) => void;
  getChange: () => number;
  onDownloadTicket?: () => void;
}

const PaymentModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  cashAmount,
  total,
  loading,
  onPaymentMethodChange,
  onCashAmountChange,
  getChange,
  onDownloadTicket
}: PaymentModalProps) => {
  const t = useTranslations('pages.pos');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (paymentMethod === 'cash' && cashAmount < total) {
      return; // No permitir confirmar si el efectivo es insuficiente
    }
    onConfirm();
  };

  const isCashInsufficient = paymentMethod === 'cash' && cashAmount < total;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{t('payment.title')}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Total */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{t('cart.total')}:</span>
              <span className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-600))` }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">{t('payment.selectMethod')}</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => onPaymentMethodChange(e.target.value as 'cash')}
                  className="text-primary-600"
                />
                <BanknotesIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.cash')}</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => onPaymentMethodChange(e.target.value as 'card')}
                  className="text-primary-600"
                />
                <CreditCardIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.card')}</span>
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
                placeholder="0.00"
              />
              {cashAmount > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('payment.change')}:</span>
                    <span className={`font-semibold text-lg ${getChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${getChange().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              {isCashInsufficient && (
                <p className="mt-2 text-sm text-red-600">
                  {t('payment.insufficientCash')}
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <Btn
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t('payment.cancel')}
            </Btn>
            {onDownloadTicket && (
              <Btn
                variant="outline"
                onClick={onDownloadTicket}
                leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                disabled={loading}
              >
                {t('payment.downloadTicket')}
              </Btn>
            )}
            <Btn
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || isCashInsufficient}
              className="flex-1"
            >
              {loading ? t('payment.processing') : t('payment.confirm')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentModal.displayName = 'PaymentModal';

export default PaymentModal; 