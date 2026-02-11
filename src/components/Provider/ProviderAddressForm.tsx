import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { ProviderAddress, ProviderAddressType } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Input, Select, Checkbox } from "@/components/atoms";

export interface ProviderAddressFormRef {
    submit: () => void;
}

interface ProviderAddressFormProps {
    providerId: string;
    address?: ProviderAddress | null;
    onClose: () => void;
    onSuccess: () => void;
    onSavingChange: (isSaving: boolean) => void;
}

interface FormData {
    type: ProviderAddressType;
    street: string;
    exterior_number: string;
    interior_number: string;
    neighborhood: string;
    city: string;
    municipality: string;
    zip_code: string;
    state: string;
    country: string;
    is_main: boolean;
}

interface FormErrors {
    street?: string;
    zip_code?: string;
}

const ProviderAddressForm = forwardRef<ProviderAddressFormRef, ProviderAddressFormProps>(
    ({ providerId, address, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.providers.addresses');

        const [formData, setFormData] = useState<FormData>({
            type: address?.type || ProviderAddressType.FISCAL,
            street: address?.street || "",
            exterior_number: address?.exterior_number || "",
            interior_number: address?.interior_number || "",
            neighborhood: address?.neighborhood || "",
            city: address?.city || "",
            municipality: address?.municipality || "",
            zip_code: address?.zip_code || "",
            state: address?.state || "",
            country: address?.country || "MEX",
            is_main: address?.is_main || false,
        });

        const [errors, setErrors] = useState<FormErrors>({});

        useEffect(() => {
            if (address) {
                setFormData({
                    type: address.type,
                    street: address.street,
                    exterior_number: address.exterior_number,
                    interior_number: address.interior_number,
                    neighborhood: address.neighborhood,
                    city: address.city,
                    municipality: address.municipality,
                    zip_code: address.zip_code,
                    state: address.state,
                    country: address.country,
                    is_main: address.is_main,
                });
            }
        }, [address]);

        const validateForm = (): boolean => {
            const newErrors: FormErrors = {};
            let isValid = true;

            if (!formData.street.trim()) {
                newErrors.street = t('errors.streetRequired');
                isValid = false;
            }

            if (!formData.zip_code.trim()) {
                newErrors.zip_code = t('errors.zipCodeRequired');
                isValid = false;
            }

            setErrors(newErrors);
            return isValid;
        };

        const handleSubmit = async () => {
            if (!validateForm()) return;

            try {
                onSavingChange(true);
                const payload = {
                    addresses: address
                        ? [{ ...formData, id: address.id }]
                        : [formData]
                };

                await providersService.updateProvider(providerId, payload as any);

                toastService.success(address ? t('messages.updated') : t('messages.created'));
                onSuccess();
            } catch (error) {
                toastService.error(error instanceof Error ? error.message : "Error saving address");
            } finally {
                onSavingChange(false);
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
        }));

        return (
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label={t('type')}
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProviderAddressType }))}
                        options={[
                            { value: ProviderAddressType.FISCAL, label: t('types.FISCAL') },
                            { value: ProviderAddressType.SHIPPING, label: t('types.SHIPPING') },
                            { value: ProviderAddressType.BILLING, label: t('types.BILLING') },
                            { value: ProviderAddressType.OTHER, label: t('types.OTHER') },
                        ]}
                    />
                    <div className="flex items-end pb-2">
                        <Checkbox
                            id="is_main"
                            label={t('isMain')}
                            checked={formData.is_main}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_main: e.target.checked }))}
                        />
                    </div>
                </div>

                <Input
                    label={t('street')}
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    error={errors.street}
                    placeholder={t('placeholders.street')}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label={t('exteriorNumber')}
                        value={formData.exterior_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, exterior_number: e.target.value }))}
                        placeholder={t('placeholders.exteriorNumber')}
                    />
                    <Input
                        label={t('interiorNumber')}
                        value={formData.interior_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, interior_number: e.target.value }))}
                        placeholder={t('placeholders.interiorNumber')}
                    />
                </div>

                <Input
                    label={t('neighborhood')}
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder={t('placeholders.neighborhood')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label={t('city')}
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder={t('placeholders.city')}
                    />
                    <Input
                        label={t('municipality')}
                        value={formData.municipality}
                        onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                        placeholder={t('placeholders.municipality')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label={t('zipCode')}
                        value={formData.zip_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                        error={errors.zip_code}
                        placeholder={t('placeholders.zipCode')}
                        required
                    />
                    <Input
                        label={t('state')}
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder={t('placeholders.state')}
                    />
                    <Input
                        label={t('country')}
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        placeholder={t('placeholders.country')}
                    />
                </div>
            </form>
        );
    }
);

ProviderAddressForm.displayName = "ProviderAddressForm";

export default ProviderAddressForm;
