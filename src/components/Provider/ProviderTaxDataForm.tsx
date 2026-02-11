import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { ProviderTaxData } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Input, Checkbox, Select } from "@/components/atoms";

export interface ProviderTaxDataFormRef {
    submit: () => void;
}

interface ProviderTaxDataFormProps {
    providerId: string;
    taxData?: ProviderTaxData | null;
    onClose: () => void;
    onSuccess: () => void;
    onSavingChange: (isSaving: boolean) => void;
}

interface FormData {
    tax_document: string;
    tax_name: string;
    tax_system: string;
    default_invoice_use: string;
    is_main: boolean;
}

interface FormErrors {
    tax_document?: string;
    tax_name?: string;
}

const REGIME_INVOICE_USE_MAP: Record<string, string[]> = {
    "G01": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "G02": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "G03": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I01": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I02": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I03": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I04": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I05": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I06": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I07": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "I08": ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"],
    "D01": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D02": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D03": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D04": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D05": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D06": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D07": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D08": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D09": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "D10": ["605", "606", "608", "611", "612", "614", "607", "615", "625"],
    "S01": ["601", "603", "605", "606", "608", "610", "611", "612", "614", "616", "620", "621", "622", "623", "624", "607", "615", "625", "626"],
    "CP01": ["601", "603", "605", "606", "608", "610", "611", "612", "614", "616", "620", "621", "622", "623", "624", "607", "615", "625", "626"],
    "CN01": ["605"]
};

const ProviderTaxDataForm = forwardRef<ProviderTaxDataFormRef, ProviderTaxDataFormProps>(
    ({ providerId, taxData, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.providers.taxData');
        const t2 = useTranslations('pages.clients.taxData');    

        const regimeOptions = useMemo(() => {
            const regimes = [
                "601", "603", "605", "606", "608", "609", "610", "611", "612", "614",
                "616", "620", "621", "622", "623", "624", "628", "607", "629", "630",
                "615", "625", "626"
            ];
            return regimes.map(code => ({
                value: code,
                label: `${code} - ${t2(`regimes.${code}`)}`
            }));
        }, [t2]);

        const initialRegime = taxData?.tax_system || "601";
        const firstValidUse = useMemo(() => {
            return Object.keys(REGIME_INVOICE_USE_MAP).find(k =>
                REGIME_INVOICE_USE_MAP[k].includes(initialRegime)
            ) || "";
        }, [initialRegime]);

        const [formData, setFormData] = useState<FormData>({
            tax_document: taxData?.tax_document || "",
            tax_name: taxData?.tax_name || "",
            tax_system: initialRegime,
            default_invoice_use: taxData?.default_invoice_use || firstValidUse,
            is_main: taxData?.is_main || false,
        });

        const invoiceUseOptions = useMemo(() => {
            return Object.entries(REGIME_INVOICE_USE_MAP)
                .filter(([_, regimes]) => regimes.includes(formData.tax_system))
                .map(([code]) => ({
                    value: code,
                    label: `${code} - ${t2(`invoiceUses.${code}`)}`
                }));
        }, [formData.tax_system, t2]);

        const [errors, setErrors] = useState<FormErrors>({});

        useEffect(() => {
            if (taxData) {
                setFormData({
                    tax_document: taxData.tax_document,
                    tax_name: taxData.tax_name,
                    tax_system: taxData.tax_system,
                    default_invoice_use: taxData.default_invoice_use,
                    is_main: taxData.is_main,
                });
            }
        }, [taxData]);

        const validateForm = (): boolean => {
            const newErrors: FormErrors = {};
            let isValid = true;

            if (!formData.tax_document.trim()) {
                newErrors.tax_document = t('errors.taxDocumentRequired');
                isValid = false;
            }

            if (!formData.tax_name.trim()) {
                newErrors.tax_name = t('errors.taxNameRequired');
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
                    taxData: taxData
                        ? [{ ...formData, id: taxData.id }]
                        : [formData]
                };

                await providersService.updateProvider(providerId, payload as any);

                toastService.success(taxData ? t('messages.updated') : t('messages.created'));
                onSuccess();
            } catch (error) {
                toastService.error(error instanceof Error ? error.message : "Error saving tax data");
            } finally {
                onSavingChange(false);
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
        }));

        return (
            <form className="space-y-6">
                <Input
                    label={t('taxDocument')}
                    value={formData.tax_document}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_document: e.target.value }))}
                    error={errors.tax_document}
                    placeholder={t('placeholders.taxDocument')}
                    required
                />

                <Input
                    label={t('taxName')}
                    value={formData.tax_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_name: e.target.value }))}
                    error={errors.tax_name}
                    placeholder={t('placeholders.taxName')}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label={t('taxSystem')}
                        value={formData.tax_system}
                        options={regimeOptions}
                        onChange={(e) => {
                            const newRegime = e.target.value;
                            const firstValid = Object.keys(REGIME_INVOICE_USE_MAP).find(k =>
                                REGIME_INVOICE_USE_MAP[k].includes(newRegime)
                            );
                            setFormData(prev => ({
                                ...prev,
                                tax_system: newRegime,
                                default_invoice_use: firstValid || ""
                            }));
                        }}
                    />
                    <Select
                        label={t('defaultInvoiceUse')}
                        value={formData.default_invoice_use}
                        options={invoiceUseOptions}
                        onChange={(e) => setFormData(prev => ({ ...prev, default_invoice_use: e.target.value }))}
                    />
                </div>

                <Checkbox
                    id="is_main_tax"
                    label={t('isMain')}
                    checked={formData.is_main}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_main: e.target.checked }))}
                />
            </form>
        );
    }
);

ProviderTaxDataForm.displayName = "ProviderTaxDataForm";

export default ProviderTaxDataForm;
