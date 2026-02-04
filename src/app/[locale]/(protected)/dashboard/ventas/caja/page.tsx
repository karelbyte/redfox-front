'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cashRegisterService } from '@/services/cash-register.service';
import { toastService } from '@/services/toast.service';
import { CashRegister } from '@/types/cash-register';
import CashRegisterModal from '@/components/POS/CashRegisterModal';
import CashDrawerModal from '@/components/POS/CashDrawerModal';
import CashBalance from '@/components/POS/CashBalance';

export default function CashRegisterPage() {
    const t = useTranslations('pages.pos');
    const tCash = useTranslations('pages.cashRegister');
    const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null);
    const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
    const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
    const [cashLoading, setCashLoading] = useState(false);
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchCurrentCashRegister();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCurrentCashRegister = async () => {
        try {
            const cashRegister = await cashRegisterService.getCurrentCashRegister();
            setCurrentCashRegister(cashRegister);
        } catch (error) {
            console.error('Error fetching current cash register:', error);
            setCurrentCashRegister(null);
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
                const newCashRegister = await cashRegisterService.createCashRegister({
                    name: `Caja ${new Date().toLocaleDateString()}`,
                    initial_amount: initialAmount,
                });
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

            await cashRegisterService.createCashTransaction({
                cash_register_id: currentCashRegister.id,
                amount: data.type === 'adjustment' ? data.amount - currentCashRegister.current_amount : data.amount,
                type: data.type,
                payment_method: 'cash',
                description: data.description,
            });

            toastService.success(
                data.type === 'closing'
                    ? t('messages.cashClosingSuccess')
                    : t('messages.cashAdjustmentSuccess')
            );

            setShowCashDrawerModal(false);
            await fetchCurrentCashRegister();
        } catch (error) {
            console.error('Error processing cash drawer operation:', error);
            toastService.error(t('messages.errorProcessingCashDrawer'));
        } finally {
            setCashLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
                    {tCash('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                    {tCash('subtitle')}
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <CashBalance
                        currentCashRegister={currentCashRegister}
                        onInitializeCash={() => setShowCashRegisterModal(true)}
                        onCashDrawer={handleCashDrawer}
                        loading={cashLoading}
                        isOpen={true}
                    />
                </div>
            </div>

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
