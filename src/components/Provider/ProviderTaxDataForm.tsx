import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { ProviderTaxData } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Input, Checkbox, Select } from "@/components/atoms";
import CustomSelect from "@/components/atoms/CustomSelect";

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

const REGIME_TYPES: Record<string, string[]> = {
    "MORAL": ["601", "603", "609", "620", "622", "623", "624", "628", "610", "626"],
    "FISICA": ["605", "606", "608", "611", "612", "614", "616", "621", "607", "629", "630", "615", "625", "610", "626"]
};

const ProviderTaxDataForm = forwardRef<ProviderTaxDataFormRef, ProviderTaxDataFormProps>(
    ({ providerId, taxData, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.providers.taxData');
        const t2 = useTranslations('pages.clients.taxData');    

        const [formData, setFormData] = useState<FormData>({
            tax_document: taxData?.tax_document || "",
            tax_name: taxData?.tax_name || "",
            tax_system: taxData?.tax_system || "601",
            default_invoice_use: taxData?.default_invoice_use || "",
            is_main: taxData?.is_main || false,
        });

        const personType = useMemo(() => {
            const cleanRfc = formData.tax_document.trim();
            if (cleanRfc.length === 12) return "MORAL";
            if (cleanRfc.length === 13) return "FISICA";
            return "BOTH";
        }, [formData.tax_document]);

        const regimeOptions = useMemo(() => {
            const regimes = [
                "601", "603", "605", "606", "608", "609", "610", "611", "612", "614",
                "616", "620", "621", "622", "623", "624", "628", "607", "629", "630",
                "615", "625", "626"
            ];

            const filtered = regimes.filter(code => {
                if (personType === "BOTH") return true;
                return REGIME_TYPES[personType]?.includes(code);
            });

            return filtered.map(code => ({
                value: code,
                label: `${code} - ${t2(`regimes.${code}`)}`
            }));
        }, [t2, personType]);

        // Auto-adjust tax system when person type changes
        useEffect(() => {
            if (personType === "BOTH") return;
            
            const isValid = REGIME_TYPES[personType]?.includes(formData.tax_system);
            if (!isValid) {
                const defaultRegime = personType === "MORAL" ? "601" : "605";
                setFormData(prev => ({
                    ...prev,
                    tax_system: defaultRegime
                }));
            }
        }, [personType]);

        const invoiceUseOptions = useMemo(() => {
            return Object.entries(REGIME_INVOICE_USE_MAP)
                .filter(([_, regimes]) => regimes.includes(formData.tax_system))
                .map(([code]) => ({
                    value: code,
                    label: `${code} - ${t2(`invoiceUses.${code}`)}`
                }));
        }, [formData.tax_system, t2]);

        // Ensure default_invoice_use is valid for the current regime
        useEffect(() => {
            const availableUses = Object.entries(REGIME_INVOICE_USE_MAP)
                .filter(([_, regimes]) => regimes.includes(formData.tax_system))
                .map(([code]) => code);
            
            if (formData.default_invoice_use && !availableUses.includes(formData.default_invoice_use)) {
                setFormData(prev => ({
                    ...prev,
                    default_invoice_use: availableUses[0] || ""
                }));
            } else if (!formData.default_invoice_use && availableUses.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    default_invoice_use: availableUses[0]
                }));
            }
        }, [formData.tax_system]);

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
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_document: e.target.value.toUpperCase() }))}
                    error={errors.tax_document}
                    placeholder={t('placeholders.taxDocument')}
                    required
                />

                <div>
                    <Input
                        label={t('taxName')}
                        value={formData.tax_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_name: e.target.value }))}
                        error={errors.tax_name}
                        required
                    />
                    <p className="text-xs text-gray-600 mt-2 whitespace-pre-line">
                        {t2('descriptions.taxName')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect
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
                    <CustomSelect
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
