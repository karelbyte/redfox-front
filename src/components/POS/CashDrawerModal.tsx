'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon, BanknotesIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { Input, Btn } from '@/components/atoms';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { type: 'closing' | 'adjustment'; amount: number; description: string }) => void;
  loading: boolean;
  currentCashRegister?: {
    id: string;
    name: string;
    current_amount: number;
  } | null;
}

const CashDrawerModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  loading,
  currentCashRegister
}: CashDrawerModalProps) => {
  const t = useTranslations('pages.pos');
  const [drawerType, setDrawerType] = useState<'closing' | 'adjustment'>('closing');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (isOpen && currentCashRegister) {
      setAmount(currentCashRegister.current_amount);
    }
  }, [isOpen, currentCashRegister]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (amount < 0) {
      return;
    }
    onConfirm({
      type: drawerType,
      amount,
      description: description.trim() || (drawerType === 'closing' ? t('cashDrawer.closingDescription') : t('cashDrawer.adjustmentDescription'))
    });
  };

  const isAmountValid = amount >= 0;
  const difference = currentCashRegister ? amount - currentCashRegister.current_amount : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CalculatorIcon className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">{t('cashDrawer.title')}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Current Balance Info */}
          {currentCashRegister && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-700">{t('cashDrawer.currentBalance')}:</span>
                <span className="text-lg font-bold text-blue-700">
                  ${currentCashRegister.current_amount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                {t('cashDrawer.cashRegister')}: {currentCashRegister.name}
              </p>
            </div>
          )}

          {/* Drawer Type Selection */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">{t('cashDrawer.selectType')}</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="closing"
                  checked={drawerType === 'closing'}
                  onChange={(e) => setDrawerType(e.target.value as 'closing')}
                  className="text-primary-600"
                />
                <BanknotesIcon className="h-5 w-5" />
                <div>
                  <span className="font-medium">{t('cashDrawer.closing')}</span>
                  <p className="text-xs text-gray-500">{t('cashDrawer.closingHelp')}</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="adjustment"
                  checked={drawerType === 'adjustment'}
                  onChange={(e) => setDrawerType(e.target.value as 'adjustment')}
                  className="text-primary-600"
                />
                <CalculatorIcon className="h-5 w-5" />
                <div>
                  <span className="font-medium">{t('cashDrawer.adjustment')}</span>
                  <p className="text-xs text-gray-500">{t('cashDrawer.adjustmentHelp')}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <Input
              label={drawerType === 'closing' ? t('cashDrawer.closingAmount') : t('cashDrawer.adjustmentAmount')}
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          {/* Difference Display */}
          {currentCashRegister && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('cashDrawer.difference')}:</span>
                <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {difference > 0 
                  ? t('cashDrawer.surplus')
                  : difference < 0 
                    ? t('cashDrawer.shortage')
                    : t('cashDrawer.exact')
                }
              </p>
            </div>
          )}

          {/* Description Input */}
          <div className="mb-6">
            <Input
              label={t('cashDrawer.description')}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={drawerType === 'closing' ? t('cashDrawer.closingDescription') : t('cashDrawer.adjustmentDescription')}
            />
          </div>

          {/* Validation Message */}
          {!isAmountValid && (
            <p className="mb-4 text-sm text-red-600">
              {t('cashDrawer.invalidAmount')}
            </p>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <Btn
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t('cashDrawer.cancel')}
            </Btn>
            <Btn
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || !isAmountValid}
              className="flex-1"
            >
              {loading 
                ? t('cashDrawer.processing') 
                : drawerType === 'closing'
                  ? t('cashDrawer.close')
                  : t('cashDrawer.adjust')
              }
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

CashDrawerModal.displayName = 'CashDrawerModal';

export default CashDrawerModal; 