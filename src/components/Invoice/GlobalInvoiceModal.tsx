'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Btn, Input } from '@/components/atoms';
import { GlobalInvoiceFormData } from '@/types/invoice';

interface GlobalInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: GlobalInvoiceFormData) => void;
    isLoading?: boolean;
}

export default function GlobalInvoiceModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: GlobalInvoiceModalProps) {
    const t = useTranslations('pages.sales.modals.globalInvoice');
    const [formData, setFormData] = useState<GlobalInvoiceFormData>({
        from: '',
        to: '',
        periodicity: 'month',
    });

    const [errors, setErrors] = useState<{ from?: string; to?: string }>({});

    const handleSubmit = () => {
        // Validate dates
        const newErrors: { from?: string; to?: string } = {};

        if (!formData.from) {
            newErrors.from = t('errors.fromRequired');
        }

        if (!formData.to) {
            newErrors.to = t('errors.toRequired');
        }

        if (formData.from && formData.to && formData.from > formData.to) {
            newErrors.to = t('errors.toMustBeAfterFrom');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onConfirm(formData);
    };

    const handleClose = () => {
        setFormData({ from: '', to: '', periodicity: 'month' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

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
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                {t('title')}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    {t('description')}
                                </p>

                                {/* Date Range */}
                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            label={t('from')}
                                            type="date"
                                            value={formData.from}
                                            onChange={(e) => {
                                                setFormData({ ...formData, from: e.target.value });
                                                setErrors({ ...errors, from: undefined });
                                            }}
                                            required
                                        />
                                        {errors.from && (
                                            <p className="text-sm text-red-600 mt-1">{errors.from}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label={t('to')}
                                            type="date"
                                            value={formData.to}
                                            onChange={(e) => {
                                                setFormData({ ...formData, to: e.target.value });
                                                setErrors({ ...errors, to: undefined });
                                            }}
                                            required
                                        />
                                        {errors.to && (
                                            <p className="text-sm text-red-600 mt-1">{errors.to}</p>
                                        )}
                                    </div>

                                    {/* Periodicity Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('periodicity')}
                                        </label>
                                        <select
                                            value={formData.periodicity}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    periodicity: e.target.value as GlobalInvoiceFormData['periodicity'],
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                                            style={{
                                                borderColor: `rgb(var(--color-primary-300))`,
                                                ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
                                            }}
                                        >
                                            <option value="day">{t('periodicities.day')}</option>
                                            <option value="week">{t('periodicities.week')}</option>
                                            <option value="fortnight">{t('periodicities.fortnight')}</option>
                                            <option value="month">{t('periodicities.month')}</option>
                                            <option value="two_months">{t('periodicities.two_months')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Btn
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            loading={isLoading}
                            className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
                        >
                            {t('create')}
                        </Btn>
                        <Btn
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center text-sm sm:mt-0 sm:w-auto"
                        >
                            {t('cancel')}
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
}
