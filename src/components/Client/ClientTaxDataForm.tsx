import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { useCountryProfile } from '@/hooks/useCountryProfile';
import { ClientTaxData } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Input, Checkbox, Select } from "@/components/atoms";
import CustomSelect from "@/components/atoms/CustomSelect";

export interface ClientTaxDataFormRef {
    submit: () => void;
}

interface ClientTaxDataFormProps {
    clientId: string;
    taxData?: ClientTaxData | null;
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

const ClientTaxDataForm = forwardRef<ClientTaxDataFormRef, ClientTaxDataFormProps>(
    ({ clientId, taxData, onSuccess, onSavingChange }, ref) => {
        const t = useTranslations('pages.clients.taxData');
        // Los campos fiscales dependen del país de la organización
        const { country } = useCountryProfile();
        const taxFields = country.customerTaxFields;

        const [formData, setFormData] = useState<FormData>({
            tax_document: taxData?.tax_document || "",
            tax_name: taxData?.tax_name || "",
            tax_system: taxData?.tax_system || "601",
            default_invoice_use: taxData?.default_invoice_use || "",
            is_main: taxData?.is_main || false,
        });

        const isDocumentValid = (value: string): boolean => {
            const { allowedLengths, numericOnly } = taxFields.document;

            if (numericOnly && !/^\d+$/.test(value)) {
                return false;
            }

            return allowedLengths.includes(value.length);
        };

        const documentLabel = t.has(`documentKinds.${taxFields.document.kind}`)
            ? t(`documentKinds.${taxFields.document.kind}`)
            : t('taxDocument');

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
                label: `${code} - ${t(`regimes.${code}`)}`
            }));
        }, [t, personType]);

        // Auto-adjust tax system when person type changes
        useEffect(() => {
            if (!taxFields.taxSystem) return;
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
                    label: `${code} - ${t(`invoiceUses.${code}`)}`
                }));
        }, [formData.tax_system, t]);

        // Ensure default_invoice_use is valid for the current regime
        useEffect(() => {
            if (!taxFields.invoiceUse) return;

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
            const document = formData.tax_document.trim();

            if (!document) {
                newErrors.tax_document = t('errors.taxDocumentRequired');
                isValid = false;
            } else if (!isDocumentValid(document)) {
                // El identificador fiscal lo define el país: la API lo rechaza
                // al emitir, así que conviene avisar al guardar el cliente.
                newErrors.tax_document = t('errors.taxDocumentFormat', {
                    lengths: taxFields.document.allowedLengths.join(' o '),
                });
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

                await clientsService.updateClient(clientId, payload as any);

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
                    label={documentLabel}
                    value={formData.tax_document}
                    onChange={(e) => {
                        const raw = e.target.value.toUpperCase();
                        setFormData(prev => ({
                            ...prev,
                            tax_document: taxFields.document.numericOnly
                                ? raw.replace(/\D/g, '')
                                : raw,
                        }));
                    }}
                    maxLength={Math.max(...taxFields.document.allowedLengths)}
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
                        {t('descriptions.taxName')}
                    </p>
                </div>

                {(taxFields.taxSystem || taxFields.invoiceUse) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {taxFields.taxSystem && (
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
                    )}
                    {taxFields.invoiceUse && (
                    <CustomSelect
                        label={t('defaultInvoiceUse')}
                        value={formData.default_invoice_use}
                        options={invoiceUseOptions}
                        onChange={(e) => setFormData(prev => ({ ...prev, default_invoice_use: e.target.value }))}
                    />
                    )}
                </div>
                )}

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

ClientTaxDataForm.displayName = "ClientTaxDataForm";

export default ClientTaxDataForm;
