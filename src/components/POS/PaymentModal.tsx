'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BanknotesIcon, CreditCardIcon, XMarkIcon, ClockIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Input, Btn, Select } from '@/components/atoms';
import { Client } from '@/types/client';
import { PaymentMethod, CardType } from '@/types/sale';
import { CertificationPackEmitter } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (generateInvoice: boolean, emitterId?: string) => void;
  paymentMethod: PaymentMethod;
  cardType?: CardType | null;
  cashAmount: number;
  total: number;
  loading: boolean;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCardTypeChange: (type: CardType | null) => void;
  onCashAmountChange: (amount: number) => void;
  getChange: () => number;
  selectedClient?: Client | null;
}

const PaymentModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  cardType,
  cashAmount,
  total,
  loading,
  onPaymentMethodChange,
  onCardTypeChange,
  onCashAmountChange,
  getChange,
  selectedClient
}: PaymentModalProps) => {
  const t = useTranslations('pages.pos');
  const [generateInvoice, setGenerateInvoice] = useState(false);
  const [emitters, setEmitters] = useState<CertificationPackEmitter[]>([]);
  const [selectedEmitter, setSelectedEmitter] = useState<string | null>(null);
  const [loadingEmitters, setLoadingEmitters] = useState(false);

  const isCashInsufficient = paymentMethod === PaymentMethod.CASH && cashAmount < total;
  const hasActiveCredit = selectedClient?.credit?.is_active === true;
  const creditLimit = selectedClient?.credit?.credit_limit || 0;
  const creditDays = selectedClient?.credit?.credit_days || 0;

  // El cliente puede facturar si está sincronizado con el PAC y tiene datos fiscales
  const canGenerateInvoice = !!(selectedClient?.pack_client_id && selectedClient?.taxData?.length);

  useEffect(() => {
    const fetchEmitters = async () => {
      if (isOpen && canGenerateInvoice) {
        setLoadingEmitters(true);
        try {
          const data = await certificationPackService.getAvailableEmitters();
          setEmitters(data || []);
          if (data && data.length > 0 && data[0].id) {
            setSelectedEmitter(data[0].id);
          }
        } catch (error) {
          console.error('Error fetching emitters:', error);
        } finally {
          setLoadingEmitters(false);
        }
      }
    };
    fetchEmitters();
  }, [isOpen, canGenerateInvoice]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (paymentMethod === PaymentMethod.CASH && cashAmount < total) {
      return;
    }
    onConfirm(generateInvoice, generateInvoice ? (selectedEmitter || undefined) : undefined);
  };

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
                  value={PaymentMethod.CASH}
                  checked={paymentMethod === PaymentMethod.CASH}
                  onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                  className="text-primary-600"
                />
                <BanknotesIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.cash')}</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={paymentMethod === PaymentMethod.CARD && cardType === CardType.CREDIT}
                  onChange={(e) => {
                    onPaymentMethodChange(PaymentMethod.CARD);
                    onCardTypeChange(CardType.CREDIT);
                  }}
                  className="text-primary-600"
                />
                <CreditCardIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.creditCard')}</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={paymentMethod === PaymentMethod.CARD && cardType === CardType.DEBIT}
                  onChange={(e) => {
                    onPaymentMethodChange(PaymentMethod.CARD);
                    onCardTypeChange(CardType.DEBIT);
                  }}
                  className="text-primary-600"
                />
                <CreditCardIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.debitCard')}</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value={PaymentMethod.TRANSFER}
                  checked={paymentMethod === PaymentMethod.TRANSFER}
                  onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                  className="text-primary-600"
                />
                <ArrowPathIcon className="h-5 w-5" />
                <span className="font-medium">{t('payment.transfer')}</span>
              </label>
              {hasActiveCredit && (
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value={PaymentMethod.CREDIT}
                    checked={paymentMethod === PaymentMethod.CREDIT}
                    onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                    className="text-primary-600"
                  />
                  <ClockIcon className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium block">{t('payment.credit')}</span>
                    <span className="text-xs text-gray-500">
                      {t('payment.creditLimit')}: ${creditLimit.toFixed(2)} | {creditDays} {t('payment.days')}
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Efectivo recibido */}
          {paymentMethod === PaymentMethod.CASH && (
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

          {/* Toggle generar factura fiscal */}
          {canGenerateInvoice && (
            <div className="mb-6 p-3 border rounded-lg bg-gray-50">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateInvoice}
                  onChange={(e) => setGenerateInvoice(e.target.checked)}
                  className="rounded text-primary-600"
                />
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <span className="font-medium text-sm block">{t('payment.generateInvoice')}</span>
                  <span className="text-xs text-gray-500">{t('payment.generateInvoiceHint')}</span>
                </div>
              </label>
            </div>
          )}

          {/* Selector de emisor */}
          {generateInvoice && canGenerateInvoice && emitters.length > 0 && (
            <div className="mb-6">
              <Select
                label={t('payment.selectEmitter')}
                value={selectedEmitter || ''}
                onChange={(e) => setSelectedEmitter(e.target.value || null)}
                disabled={loadingEmitters}
                options={emitters.filter(e => e.id).map(emitter => ({ value: emitter.id!, label: emitter.name }))}
              />
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