import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { ClientAddress, AddressType } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Input, Select, Checkbox } from "@/components/atoms";

export interface ClientAddressFormRef {
    submit: () => void;
}

interface ClientAddressFormProps {
    clientId: string;
    address?: ClientAddress | null;
    onClose: () => void;
    onSuccess: () => void;
    onSavingChange: (isSaving: boolean) => void;
}

interface FormData {
    type: AddressType;
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
    exterior_number?: string;
    neighborhood?: string;
    city?: string;
    municipality?: string;
    zip_code?: string;
    state?: string;
}

// Campos obligatorios por tipo de dirección
const REQUIRED_FIELDS: Record<AddressType, (keyof FormErrors)[]> = {
    [AddressType.BILLING]:  ['zip_code'],
    [AddressType.SHIPPING]: ['street', 'exterior_number', 'neighborhood', 'city', 'municipality', 'zip_code', 'state'],
    [AddressType.OTHER]:    ['zip_code'],
};

const ClientAddressForm = forwardRef<ClientAddressFormRef, ClientAddressFormProps>(
    ({ clientId, address, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.clients.addresses');

        const [formData, setFormData] = useState<FormData>({
            type: address?.type || AddressType.BILLING,
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

        // Limpia errores de campos que ya no son obligatorios al cambiar de tipo
        useEffect(() => {
            setErrors({});
        }, [formData.type]);

        const isRequired = (field: keyof FormErrors): boolean => {
            return REQUIRED_FIELDS[formData.type]?.includes(field) ?? false;
        };

        const validateForm = (): boolean => {
            const requiredFields = REQUIRED_FIELDS[formData.type] || [];
            const newErrors: FormErrors = {};
            let isValid = true;

            requiredFields.forEach((field) => {
                const value = formData[field as keyof FormData];
                if (typeof value === 'string' && !value.trim()) {
                    newErrors[field] = t(`errors.${field}Required`);
                    isValid = false;
                }
            });

            setErrors(newErrors);
            return isValid;
        };

        const handleSubmit = async () => {
            if (!validateForm()) return;

            try {
                onSavingChange(true);

                // Limpiar campos vacíos para evitar errores de validación en backend
                const cleanedData: any = { ...formData };
                Object.keys(cleanedData).forEach(key => {
                    if (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === '') {
                        cleanedData[key] = undefined;
                    }
                });

                const payload = {
                    addresses: address
                        ? [{ ...cleanedData, id: address.id }]
                        : [cleanedData]
                };

                await clientsService.updateClient(clientId, payload as any);
                toastService.success(address ? t('messages.updated') : t('messages.created'));
                onSuccess();
            } catch (error: any) {
                console.error('Error saving address:', error);
                const errorMessage = error?.message || t('messages.error');
                toastService.error(errorMessage);
            } finally {
                onSavingChange(false);
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
        }));

        const isBilling = formData.type === AddressType.BILLING;

        return (
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label={t('type')}
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AddressType }))}
                        options={[
                            { value: AddressType.BILLING, label: t('types.BILLING') },
                            { value: AddressType.SHIPPING, label: t('types.SHIPPING') },
                            { value: AddressType.OTHER, label: t('types.OTHER') },
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

                {/* Código Postal — siempre visible, siempre obligatorio */}
                <Input
                    label={t('zipCode')}
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    error={errors.zip_code}
                    placeholder={t('placeholders.zipCode')}
                    required
                />

                {/* Campos adicionales solo para SHIPPING / OTHER */}
                <Input
                    label={t('street')}
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    error={errors.street}
                    placeholder={t('placeholders.street')}
                    required={isRequired('street')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label={t('exteriorNumber')}
                        value={formData.exterior_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, exterior_number: e.target.value }))}
                        error={errors.exterior_number}
                        placeholder={t('placeholders.exteriorNumber')}
                        required={isRequired('exterior_number')}
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
                    error={errors.neighborhood}
                    placeholder={t('placeholders.neighborhood')}
                    required={isRequired('neighborhood')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label={t('city')}
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        error={errors.city}
                        placeholder={t('placeholders.city')}
                        required={isRequired('city')}
                    />
                    <Input
                        label={t('municipality')}
                        value={formData.municipality}
                        onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                        error={errors.municipality}
                        placeholder={t('placeholders.municipality')}
                        required={isRequired('municipality')}
                    />
                </div>

                <div className={`grid grid-cols-1 gap-4 ${isBilling ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    <Input
                        label={t('state')}
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        error={errors.state}
                        placeholder={t('placeholders.state')}
                        required={isRequired('state')}
                    />
                    {isBilling && (
                        <Input
                            label={t('country')}
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder={t('placeholders.country')}
                        />
                    )}
                    {!isBilling && (
                        <Input
                            label={t('country')}
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder={t('placeholders.country')}
                        />
                    )}
                </div>
            </form>
        );
    }
);

ClientAddressForm.displayName = "ClientAddressForm";

export default ClientAddressForm;
