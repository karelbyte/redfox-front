'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon, BanknotesIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Input, Btn, SearchInput } from '@/components/atoms';
import { cashRegisterService } from '@/services/cash-register.service';
import { CashRegister } from '@/types/cash-register';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (initialAmount: number, selectedCashRegister?: CashRegister) => void;
  loading: boolean;
  currentCashRegister?: {
    id: string;
    name: string;
    current_amount: number;
  } | null;
}

const CashRegisterModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  loading,
  currentCashRegister
}: CashRegisterModalProps) => {
  const t = useTranslations('pages.pos');
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [loadingCashRegisters, setLoadingCashRegisters] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);
  const [showExistingRegisters, setShowExistingRegisters] = useState(false);

  useEffect(() => {
    if (isOpen && !currentCashRegister) {
      fetchCashRegisters();
    }
  }, [isOpen, currentCashRegister]);

  const fetchCashRegisters = async () => {
    try {
      setLoadingCashRegisters(true);
      const response = await cashRegisterService.getCashRegisters(1, 10, searchTerm);
      setCashRegisters(response.data || []);
    } catch (error) {
      console.error('Error fetching cash registers:', error);
    } finally {
      setLoadingCashRegisters(false);
    }
  };

  const handleSearch = () => {
    fetchCashRegisters();
  };

  const handleSelectCashRegister = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setInitialAmount(cashRegister.current_amount);
    setShowExistingRegisters(false);
  };

  const handleConfirm = () => {
    if (initialAmount < 0) {
      return;
    }
    onConfirm(initialAmount, selectedCashRegister || undefined);
  };

  const isAmountValid = initialAmount >= 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">
                {currentCashRegister ? t('cashRegister.updateBalance') : t('cashRegister.initialize')}
              </h3>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">{t('cashRegister.currentBalance')}:</span>
                <span className="text-lg font-bold text-blue-700">
                  ${currentCashRegister.current_amount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {t('cashRegister.cashRegister')}: {currentCashRegister.name}
              </p>
            </div>
          )}

          {/* Selected Cash Register Info */}
          {selectedCashRegister && !currentCashRegister && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">{t('cashRegister.selectedRegister')}:</span>
                <span className="text-sm font-medium text-green-700">
                  {selectedCashRegister.name}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-green-600">{t('cashRegister.currentBalance')}:</span>
                <span className="text-sm font-bold text-green-700">
                  ${selectedCashRegister.current_amount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {t('cashRegister.status')}: {selectedCashRegister.status === 'open' ? t('cashRegister.open') : t('cashRegister.closed')}
              </p>
            </div>
          )}

          {/* Search Existing Cash Registers */}
          {!currentCashRegister && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExistingRegisters(!showExistingRegisters)}
                  className="flex items-center space-x-1"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>{t('cashRegister.searchExisting')}</span>
                </Btn>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCashRegister(null);
                    setInitialAmount(0);
                  }}
                  className="flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>{t('cashRegister.createNew')}</span>
                </Btn>
              </div>

              {showExistingRegisters && (
                <div className="space-y-3">
                  <SearchInput
                    placeholder={t('cashRegister.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    loading={loadingCashRegisters}
                  />

                  {loadingCashRegisters ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">{t('cashRegister.loading')}</p>
                    </div>
                  ) : cashRegisters.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {cashRegisters.map((cashRegister) => (
                        <div
                          key={cashRegister.id}
                          onClick={() => handleSelectCashRegister(cashRegister)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedCashRegister?.id === cashRegister.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{cashRegister.name}</p>
                              <p className="text-xs text-gray-500">{cashRegister.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">${cashRegister.current_amount.toFixed(2)}</p>
                              <p className={`text-xs ${
                                cashRegister.status === 'open' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {cashRegister.status === 'open' ? t('cashRegister.open') : t('cashRegister.closed')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">{t('cashRegister.noRegistersFound')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Initial Amount Input */}
          <div className="mb-6">
            <Input
              label={currentCashRegister ? t('cashRegister.newAmount') : t('cashRegister.initialAmount')}
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentCashRegister 
                ? t('cashRegister.newAmountHelp')
                : t('cashRegister.initialAmountHelp')
              }
            </p>
          </div>

          {/* Validation Message */}
          {!isAmountValid && (
            <p className="mb-4 text-sm text-red-600">
              {t('cashRegister.invalidAmount')}
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
              {t('cashRegister.cancel')}
            </Btn>
            <Btn
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || !isAmountValid}
              className="flex-1"
            >
              {loading 
                ? t('cashRegister.processing') 
                : currentCashRegister 
                  ? t('cashRegister.update') 
                  : t('cashRegister.initialize')
              }
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
});

CashRegisterModal.displayName = 'CashRegisterModal';

export default CashRegisterModal; 