"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AccountReceivable, PaymentMethod } from '@/types/account-receivable';
import Drawer from '@/components/Drawer/Drawer';
import { Input, Select } from '@/components/atoms';

interface PaymentDrawerProps {
  account: AccountReceivable;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function PaymentDrawer({
  account,
  isOpen,
  onClose,
  onSubmit,
  isSaving,
}: PaymentDrawerProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.CASH);
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const remainingAmount = typeof account.remainingAmount === 'string' 
    ? parseFloat(account.remainingAmount) 
    : account.remainingAmount;

  const totalAmount = typeof account.totalAmount === 'string'
    ? parseFloat(account.totalAmount)
    : account.totalAmount;

  useEffect(() => {
    if (isOpen) {
      // Reset form when drawer opens
      setAmount(remainingAmount.toFixed(2));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod(PaymentMethod.CASH);
      setReference('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen, remainingAmount]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = t('paymentDrawer.errors.amountRequired');
    } else if (parseFloat(amount) > remainingAmount) {
      newErrors.amount = t('paymentDrawer.errors.amountExceedsRemaining');
    }

    if (!paymentDate) {
      newErrors.paymentDate = t('paymentDrawer.errors.dateRequired');
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = t('paymentDrawer.errors.methodRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await onSubmit({
      amount: parseFloat(amount),
      paymentDate,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  const paymentMethodOptions = [
    { value: PaymentMethod.CASH, label: t('paymentDrawer.methods.cash') },
    { value: PaymentMethod.CREDIT_CARD, label: t('paymentDrawer.methods.creditCard') },
    { value: PaymentMethod.DEBIT_CARD, label: t('paymentDrawer.methods.debitCard') },
    { value: PaymentMethod.BANK_TRANSFER, label: t('paymentDrawer.methods.bankTransfer') },
    { value: PaymentMethod.CHECK, label: t('paymentDrawer.methods.check') },
    { value: PaymentMethod.OTHER, label: t('paymentDrawer.methods.other') },
  ];

  return (
    <Drawer
      id="payment-drawer"
      isOpen={isOpen}
      onClose={onClose}
      title={t('registerPayment')}
      onSave={handleSave}
      isSaving={isSaving}
      isFormValid={true}
      width="max-w-lg"
    >
      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('paymentDrawer.reference')}:</span>
            <span className="text-sm font-semibold">{account.referenceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('paymentDrawer.totalAmount')}:</span>
            <span className="text-sm font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('paymentDrawer.remainingAmount')}:</span>
            <span className="text-sm font-semibold text-red-600">${remainingAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <Input
            label={t('paymentDrawer.amount')}
            type="number"
            step="0.01"
            min="0"
            max={remainingAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            required
          />

          <Input
            label={t('paymentDrawer.paymentDate')}
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            error={errors.paymentDate}
            required
          />

          <Select
            label={t('paymentDrawer.paymentMethod')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={paymentMethodOptions}
            error={errors.paymentMethod}
            required
          />

          <Input
            label={t('paymentDrawer.reference')}
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('paymentDrawer.referencePlaceholder')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('paymentDrawer.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('paymentDrawer.notesPlaceholder')}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
