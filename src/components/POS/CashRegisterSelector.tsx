'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import { BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CashRegister } from '@/types/cash-register';
import { Btn } from '@/components/atoms';

interface CashRegisterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  cashRegisters: CashRegister[];
  onSelect: (cashRegister: CashRegister) => void;
  currentCashRegister?: CashRegister | null;
}

const CashRegisterSelector = React.memo(({
  isOpen,
  onClose,
  cashRegisters,
  onSelect,
  currentCashRegister
}: CashRegisterSelectorProps) => {
  const t = useTranslations('pages.pos.cashRegister');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">
                {t('selectCashRegister')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t('multipleAvailable')}
          </p>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {cashRegisters.map((cashRegister) => (
              <button
                key={cashRegister.id}
                onClick={() => onSelect(cashRegister)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  currentCashRegister?.id === cashRegister.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {cashRegister.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cashRegister.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${cashRegister.current_amount.toFixed(2)}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {t('open')}
                    </span>
                  </div>
                </div>
                {currentCashRegister?.id === cashRegister.id && (
                  <p className="text-xs text-primary-600 mt-2 font-medium">
                    {t('workingIn')}
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Btn
              variant="secondary"
              onClick={onClose}
            >
              {t('cancel')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

CashRegisterSelector.displayName = 'CashRegisterSelector';

export default CashRegisterSelector;
