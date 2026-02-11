"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { clientsService } from "@/services/clients.service";
import { currenciesService } from "@/services/currencies.service";
import { toastService } from "@/services/toast.service";
import { Input, Select, Checkbox } from "@/components/atoms";

export interface ClientCreditFormRef {
    submit: () => void;
}

interface ClientCreditFormProps {
    clientId: string;
    credit?: any;
    onClose: () => void;
    onSuccess: () => void;
    onSavingChange: (isSaving: boolean) => void;
}

interface FormData {
    credit_limit: number;
    credit_days: number;
    is_active: boolean;
    currency_id: string;
}

const ClientCreditForm = forwardRef<ClientCreditFormRef, ClientCreditFormProps>(
    ({ clientId, credit, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.clients.credit');
        const [currencies, setCurrencies] = useState<any[]>([]);
        const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

        const [formData, setFormData] = useState<FormData>({
            credit_limit: credit?.credit_limit || 0,
            credit_days: credit?.credit_days || 0,
            is_active: credit?.is_active ?? true,
            currency_id: credit?.currency_id || "",
        });

        useEffect(() => {
            const fetchCurrencies = async () => {
                try {
                    setIsLoadingCurrencies(true);
                    const response = await currenciesService.getCurrencies();
                    setCurrencies(response.data);

                    // If no currency is set, pick the first one (usually MXN or USD)
                    if (!formData.currency_id && response.data.length > 0) {
                        setFormData(prev => ({ ...prev, currency_id: response.data[0].id }));
                    }
                } catch (error) {
                    toastService.error("Error loading currencies");
                } finally {
                    setIsLoadingCurrencies(false);
                }
            };
            fetchCurrencies();
        }, []);

        useEffect(() => {
            if (credit) {
                setFormData({
                    credit_limit: credit.credit_limit,
                    credit_days: credit.credit_days,
                    is_active: credit.is_active,
                    currency_id: credit.currency_id || "",
                });
            }
        }, [credit]);

        const handleSubmit = async () => {
            try {
                onSavingChange(true);
                const payload = {
                    credit: {
                        ...formData,
                        credit_limit: Number(formData.credit_limit),
                        credit_days: Number(formData.credit_days),
                    }
                };

                await clientsService.updateClient(clientId, payload as any);

                toastService.success(t('messages.updated'));
                onSuccess();
            } catch (error) {
                toastService.error(error instanceof Error ? error.message : "Error saving credit conditions");
            } finally {
                onSavingChange(false);
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
        }));

        const currencyOptions = currencies.map(c => ({
            value: c.id,
            label: `${c.code} - ${c.name}`
        }));

        return (
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        type="number"
                        label={t('limit')}
                        value={formData.credit_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: Number(e.target.value) }))}
                        placeholder={t('placeholders.limit')}
                        step="0.01"
                        min="0"
                    />
                    <Input
                        type="number"
                        label={t('days')}
                        value={formData.credit_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit_days: Number(e.target.value) }))}
                        placeholder={t('placeholders.days')}
                        min="0"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label={t('currency')}
                        value={formData.currency_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency_id: e.target.value }))}
                        options={currencyOptions}
                        disabled={isLoadingCurrencies}
                    />
                    <div className="flex items-end pb-3">
                        <Checkbox
                            id="credit_active"
                            label={t('isActive')}
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                    </div>
                </div>
            </form>
        );
    }
);

ClientCreditForm.displayName = "ClientCreditForm";

export default ClientCreditForm;
