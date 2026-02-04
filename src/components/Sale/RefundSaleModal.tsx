'use client'

import { useTranslations } from 'next-intl';
import { Sale } from '@/types/sale';
import { Btn } from '@/components/atoms';

interface RefundSaleModalProps {
    isOpen: boolean;
    sale: Sale | null;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function RefundSaleModal({
    isOpen,
    sale,
    onClose,
    onConfirm,
    isLoading = false
}: RefundSaleModalProps) {
    const t = useTranslations('pages.sales');

    if (!isOpen || !sale) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div
                            className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                            style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
                        >
                            <svg
                                className="h-6 w-6"
                                style={{ color: `rgb(var(--color-primary-600))` }}
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                {t('modals.refund.title')}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {t('modals.refund.message', { code: sale.code })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Btn
                            variant="danger"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
                        >
                            {isLoading ? t('actions.refunded') : t('actions.refund')}
                        </Btn>
                        <Btn
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center text-sm sm:mt-0 sm:w-auto"
                        >
                            {t('actions.cancel')}
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
} 
