'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cashRegisterService } from '@/services/cash-register.service';
import { toastService } from '@/services/toast.service';
import { CashRegister, CashTransaction } from '@/types/cash-register';
import CashRegisterModal from '@/components/POS/CashRegisterModal';
import CashDrawerModal from '@/components/POS/CashDrawerModal';
import { 
    BanknotesIcon, 
    PlusIcon, 
    CogIcon, 
    DocumentTextIcon,
    ClockIcon,
    ArrowPathIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';

export default function CashRegisterPage() {
    const t = useTranslations('pages.pos');
    const tCash = useTranslations('pages.cashRegister');
    const locale = useLocale();
    const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null);
    const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
    const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
    const [cashLoading, setCashLoading] = useState(false);
    const [transactions, setTransactions] = useState<CashTransaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [cashAmount, setCashAmount] = useState<number>(0);
    const [hasShownNoCashToast, setHasShownNoCashToast] = useState(false);
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchCurrentCashRegister();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (currentCashRegister && currentCashRegister.status === 'open') {
            fetchTransactions();
        }
    }, [currentCashRegister]);

    const fetchCurrentCashRegister = async () => {
        try {
            const cashRegister = await cashRegisterService.getCurrentCashRegister();
            setCurrentCashRegister(cashRegister);
            // Reset el flag si se encuentra una caja
            if (cashRegister) {
                setHasShownNoCashToast(false);
            }
        } catch (error) {
            // Mostrar toast informativo cuando no hay caja abierta (solo una vez)
            if (error instanceof Error && 
                (error.message.includes('no open cash register') || 
                 error.message.includes('There is no open cash register currently'))) {
                if (!hasShownNoCashToast) {
                    toastService.info(tCash('messages.noCashRegisterActive'));
                    setHasShownNoCashToast(true);
                }
            } else {
                // Solo mostrar error en consola para errores reales
                console.error('Error fetching current cash register:', error);
                toastService.error(tCash('messages.errorFetchingInfo'));
            }
            setCurrentCashRegister(null);
        }
    };

    const fetchTransactions = async () => {
        if (!currentCashRegister) return;
        
        try {
            setLoadingTransactions(true);
            const response = await cashRegisterService.getCashTransactions(currentCashRegister.id, 1, 50);
            const transactionData = response.data || [];
            setTransactions(transactionData);
            
            // Calculate cash amount
            let calculatedCashAmount = 0;
            transactionData.forEach(transaction => {
                if (transaction.payment_method === 'cash') {
                    if (transaction.type === 'sale') {
                        calculatedCashAmount += transaction.amount;
                    } else if (transaction.type === 'refund') {
                        calculatedCashAmount -= transaction.amount;
                    } else if (transaction.type === 'adjustment') {
                        calculatedCashAmount += transaction.amount;
                    }
                }
            });
            setCashAmount(calculatedCashAmount);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleInitializeCash = async (initialAmount: number, selectedCashRegister?: CashRegister) => {
        try {
            setCashLoading(true);

            if (selectedCashRegister) {
                // Usar caja registradora existente
                await cashRegisterService.openCashRegister(initialAmount, selectedCashRegister.name);
                toastService.success(t('messages.cashRegisterOpened'));
            } else if (currentCashRegister) {
                // Actualizar caja actual
                await cashRegisterService.updateCashRegister(currentCashRegister.id, {
                    initial_amount: initialAmount,
                });
                toastService.success(t('messages.cashRegisterUpdated'));
            } else {
                // Crear nueva caja
                const newCashRegister = await cashRegisterService.openCashRegister(
                    initialAmount,
                    `${tCash('title')} ${new Date().toLocaleDateString()}`,
                    tCash('subtitle')
                );
                toastService.success(t('messages.cashRegisterCreated'));
                setCurrentCashRegister(newCashRegister);
            }

            setShowCashRegisterModal(false);
            await fetchCurrentCashRegister();
        } catch (error) {
            console.error('Error initializing cash register:', error);
            toastService.error(t('messages.errorInitializingCash'));
        } finally {
            setCashLoading(false);
        }
    };

    const handleCashDrawer = () => {
        setShowCashDrawerModal(true);
    };

    const handleCashDrawerConfirm = async (data: { type: 'closing' | 'adjustment'; amount: number; description: string }) => {
        if (!currentCashRegister) return;

        try {
            setCashLoading(true);

            // Crear transacción de caja
            await cashRegisterService.createCashTransaction({
                cash_register_id: currentCashRegister.id,
                type: data.type === 'closing' ? 'adjustment' : 'adjustment',
                amount: data.amount,
                description: data.description,
                reference: `${data.type.toUpperCase()}-${Date.now()}`,
                payment_method: 'cash'
            });

            // Si es cierre, cerrar la caja
            if (data.type === 'closing') {
                await cashRegisterService.closeCashRegister(currentCashRegister.id, data.amount, data.description);
                toastService.success(t('messages.cashRegisterClosed'));
            } else {
                toastService.success(t('messages.cashAdjustmentSuccess'));
            }

            setShowCashDrawerModal(false);
            await fetchCurrentCashRegister();
        } catch (error) {
            console.error('Error processing cash drawer operation:', error);
            toastService.error(t('messages.errorProcessingCashDrawer'));
        } finally {
            setCashLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
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
                return <BanknotesIcon className="h-5 w-5 text-green-600" />;
            case 'card':
                return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
            default:
                return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
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
            case 'closing':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'sale':
                return tCash('transactions.types.sale');
            case 'refund':
                return tCash('transactions.types.refund');
            case 'adjustment':
                return tCash('transactions.types.adjustment');
            case 'closing':
                return tCash('transactions.types.closing');
            default:
                return type;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
                    {tCash('title')}
                </h1>
                <p className="text-gray-600 mt-2">
                    {tCash('subtitle')}
                </p>
            </div>

            {currentCashRegister ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cash Register Info - Left Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <BanknotesIcon className="h-8 w-8 text-primary-600" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{tCash('status.title')}</h2>
                                    <p className="text-sm text-gray-500">{currentCashRegister.name}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-sm font-medium text-gray-700">{tCash('status.label')}:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    currentCashRegister.status === 'open' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {currentCashRegister.status === 'open' ? tCash('status.open') : tCash('status.closed')}
                                </span>
                            </div>

                            {/* Total Balance */}
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-700 mb-2">{tCash('balance.total')}</p>
                                    <p className="text-3xl font-bold text-blue-800">
                                        ${currentCashRegister.current_amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Cash Amount */}
                            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-green-700 mb-2">{tCash('balance.cash')}</p>
                                    <p className="text-3xl font-bold text-green-800">
                                        ${cashAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {currentCashRegister.status === 'open' && (
                                <div className="space-y-3">
                                    <Btn
                                        onClick={() => setShowCashRegisterModal(true)}
                                        disabled={cashLoading}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <CogIcon className="h-4 w-4 mr-2" />
                                        {tCash('actions.updateBalance')}
                                    </Btn>
                                    <Btn
                                        onClick={handleCashDrawer}
                                        disabled={cashLoading}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        {tCash('actions.cashDrawer')}
                                    </Btn>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transactions List - Right Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <ClockIcon className="h-6 w-6 text-gray-600" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{tCash('transactions.title')}</h2>
                                            <p className="text-sm text-gray-500">{tCash('transactions.subtitle')}</p>
                                        </div>
                                    </div>
                                    <Btn
                                        size="sm"
                                        variant="outline"
                                        onClick={fetchTransactions}
                                        disabled={loadingTransactions}
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                                        {tCash('transactions.refresh')}
                                    </Btn>
                                </div>
                            </div>

                            <div className="p-6">
                                {loadingTransactions ? (
                                    <div className="text-center py-12">
                                        <ArrowPathIcon className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                                        <p className="text-gray-500">{tCash('transactions.loading')}</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="space-y-3">
                                        {transactions.map((transaction) => (
                                            <div key={transaction.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {getPaymentMethodIcon(transaction.payment_method)}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{transaction.description}</p>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                                                                <span className={`text-sm font-medium capitalize ${getTransactionTypeColor(transaction.type)}`}>
                                                                    {getTransactionTypeLabel(transaction.type)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 capitalize">
                                                                    {transaction.payment_method === 'cash' ? tCash('transactions.paymentMethods.cash') : tCash('transactions.paymentMethods.card')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                                                            {transaction.type === 'refund' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">{tCash('transactions.empty')}</p>
                                        <p className="text-gray-400 text-sm">{tCash('transactions.emptyDescription')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* No Cash Register State */
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{tCash('noCashRegister.title')}</h3>
                        <p className="text-gray-500 mb-8">
                            {tCash('noCashRegister.description')}
                        </p>
                        <Btn
                            onClick={() => setShowCashRegisterModal(true)}
                            disabled={cashLoading}
                            className="flex items-center space-x-2 mx-auto"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>{tCash('actions.initializeCash')}</span>
                        </Btn>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CashRegisterModal
                isOpen={showCashRegisterModal}
                onClose={() => setShowCashRegisterModal(false)}
                onConfirm={handleInitializeCash}
                loading={cashLoading}
                currentCashRegister={currentCashRegister}
            />

            <CashDrawerModal
                isOpen={showCashDrawerModal}
                onClose={() => setShowCashDrawerModal(false)}
                onConfirm={handleCashDrawerConfirm}
                loading={cashLoading}
                currentCashRegister={currentCashRegister}
            />
        </div>
    );
}
