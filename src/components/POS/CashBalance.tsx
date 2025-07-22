'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BanknotesIcon, PlusIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { cashRegisterService } from '@/services/cash-register.service';
import { CashTransaction } from '@/types/cash-register';

interface CashBalanceProps {
  currentCashRegister?: {
    id: string;
    name: string;
    current_amount: number;
    status: 'open' | 'closed';
  } | null;
  onInitializeCash: () => void;
  onCashDrawer: () => void;
  loading?: boolean;
  isOpen?: boolean;
}

const CashBalance = React.memo(({
  currentCashRegister,
  onInitializeCash,
  onCashDrawer,
  loading = false,
  isOpen = false
}: CashBalanceProps) => {
  const t = useTranslations('pages.pos');
  const [recentTransactions, setRecentTransactions] = useState<CashTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [realBalance, setRealBalance] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (currentCashRegister && currentCashRegister.status === 'open' && isOpen) {
      console.log('🔄 CashBalance useEffect triggered:', {
        cashRegisterId: currentCashRegister.id,
        initialAmount: currentCashRegister.current_amount,
        isOpen
      });
      fetchRecentTransactions();
      fetchRealBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCashRegister, isOpen]);

  // Debug effect para monitorear cambios en realBalance
  useEffect(() => {
    console.log('💰 realBalance changed:', realBalance);
  }, [realBalance]);

  // Debug effect para monitorear cambios en currentCashRegister
  useEffect(() => {
    if (currentCashRegister) {
      console.log('🏦 currentCashRegister updated:', {
        id: currentCashRegister.id,
        current_amount: currentCashRegister.current_amount,
        status: currentCashRegister.status
      });
    }
  }, [currentCashRegister]);

  const fetchRealBalance = async () => {
    if (!currentCashRegister) return;
    
    try {
      setLoadingBalance(true);
      console.log('💰 Starting fetchRealBalance for cash register:', currentCashRegister.id);
      
      // Obtener transacciones para calcular el dinero en efectivo
      const response = await cashRegisterService.getCashTransactions(currentCashRegister.id, 1, 100);
      const transactions = response.data || [];
      
      // Calcular dinero en efectivo: solo transacciones en efectivo
      let calculatedCashAmount = 0;
      
      transactions.forEach((transaction) => {
        if (transaction.payment_method === 'cash') {
          if (transaction.type === 'sale') {
            calculatedCashAmount += transaction.amount; // Las ventas en efectivo aumentan el dinero en efectivo
          } else if (transaction.type === 'refund') {
            calculatedCashAmount -= transaction.amount; // Los reembolsos en efectivo disminuyen el dinero en efectivo
          } else if (transaction.type === 'adjustment') {
            calculatedCashAmount += transaction.amount; // Los ajustes pueden ser positivos o negativos
          }
        }
        // Las transacciones con tarjeta NO afectan el dinero en efectivo
      });
      
      console.log('💵 Calculated cash amount:', {
        transactions: transactions.length,
        calculatedCash: calculatedCashAmount,
        totalBalance: currentCashRegister.current_amount
      });
      
      setRealBalance(currentCashRegister.current_amount);
      setCashAmount(calculatedCashAmount);
    } catch (error) {
      console.error('❌ Error getting balance from server:', error);
      // Si falla, usar el balance básico
      setRealBalance(currentCashRegister.current_amount);
      setCashAmount(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!currentCashRegister) return;
    
    try {
      setLoadingTransactions(true);
      const response = await cashRegisterService.getCashTransactions(currentCashRegister.id, 1, 100);
      const transactions = response.data || [];
      setRecentTransactions(transactions.slice(0, 10)); // Mostrar solo las primeras 10 en la UI
      
      // Calcular dinero en efectivo
      let calculatedCashAmount = 0;
      
      transactions.forEach(transaction => {
        if (transaction.payment_method === 'cash') {
          if (transaction.type === 'sale') {
            calculatedCashAmount += transaction.amount; // Las ventas en efectivo aumentan el dinero en efectivo
          } else if (transaction.type === 'refund') {
            calculatedCashAmount -= transaction.amount; // Los reembolsos en efectivo disminuyen el dinero en efectivo
          } else if (transaction.type === 'adjustment') {
            calculatedCashAmount += transaction.amount; // Los ajustes pueden ser positivos o negativos
          }
        }
        // Las transacciones con tarjeta NO afectan el dinero en efectivo
      });
      
      // Actualizar el balance real con el valor del servidor
      setRealBalance(currentCashRegister.current_amount);
      setCashAmount(calculatedCashAmount);
      console.log('💰 Updated balances from server:', {
        current_amount: currentCashRegister.current_amount,
        cash_amount: calculatedCashAmount,
        transactions: transactions.length
      });
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4 text-green-600" />;
      case 'card':
        return <DocumentTextIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-600';
      case 'refund':
        return 'text-red-600';
      case 'adjustment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {currentCashRegister ? (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{t('cashBalance.status')}:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentCashRegister.status === 'open' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {currentCashRegister.status === 'open' 
                ? t('cashBalance.open') 
                : t('cashBalance.closed')
              }
            </span>
          </div>

          {/* Cash Register Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{t('cashBalance.cashRegister')}:</span>
            <span className="text-sm font-medium text-gray-900">{currentCashRegister.name}</span>
          </div>

          {/* Current Balance */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">{t('cashBalance.currentBalance')}:</span>
            <span className="text-xl font-bold text-blue-700">
              {loadingBalance ? (
                <span className="text-sm text-blue-600">{t('cashBalance.loadingBalance')}</span>
              ) : (
                `$${realBalance.toFixed(2)}`
              )}
            </span>
          </div>

          {/* Cash Amount */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700">{t('cashBalance.cashAmount')}:</span>
            <span className="text-xl font-bold text-green-700">
              {loadingBalance ? (
                <span className="text-sm text-green-600">{t('cashBalance.loadingBalance')}</span>
              ) : (
                `$${cashAmount.toFixed(2)}`
              )}
            </span>
          </div>

          {/* Recent Transactions */}
          {currentCashRegister.status === 'open' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>{t('cashBalance.recentTransactions')}</span>
                </h4>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    fetchRecentTransactions();
                    fetchRealBalance();
                  }}
                  disabled={loadingTransactions || loadingBalance}
                >
                  {t('cashBalance.refresh')}
                </Btn>
              </div>
              
              {loadingTransactions ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">{t('cashBalance.loadingTransactions')}</p>
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(transaction.payment_method)}
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">{t('cashBalance.noTransactions')}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {currentCashRegister.status === 'open' && (
            <div className="space-y-3">
              <Btn
                onClick={onInitializeCash}
                disabled={loading}
                className="w-full mr-2"
                variant="outline"
              >
                {t('cashBalance.updateBalance')}
              </Btn>
              <Btn
                onClick={onCashDrawer}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {t('cashBalance.cutDrawer')}
              </Btn>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('cashBalance.noCashRegister')}</h3>
          <p className="text-sm text-gray-500 mb-6">{t('cashBalance.initializeCash')}</p>
          <Btn
            onClick={onInitializeCash}
            disabled={loading}
            className="flex items-center space-x-2 mx-auto"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t('cashBalance.initializeCash')}</span>
          </Btn>
        </div>
      )}
    </div>
  );
});

CashBalance.displayName = 'CashBalance';

export default CashBalance; 