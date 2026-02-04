import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Input, TextArea, Checkbox, SurrogateInput } from "@/components/atoms";

export interface ClientFormRef {
  submit: () => void;
}

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address_street: string;
  address_exterior: string;
  address_interior: string;
  address_neighborhood: string;
  address_city: string;
  address_municipality: string;
  address_zip: string;
  address_state: string;
  address_country: string;
  tax_document: string;
  tax_system: string;
  default_invoice_use: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  email?: string;
  tax_document?: string;
}

const ClientForm = forwardRef<ClientFormRef, ClientFormProps>(
  ({ client, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.clients');

    const [formData, setFormData] = useState<FormData>({
      code: client?.code || "",
      name: client?.name || "",
      description: client?.description || "",
      phone: client?.phone || "",
      email: client?.email || "",
      address_street: client?.address_street || "",
      address_exterior: client?.address_exterior || "",
      address_interior: client?.address_interior || "",
      address_neighborhood: client?.address_neighborhood || "",
      address_city: client?.address_city || "",
      address_municipality: client?.address_municipality || "",
      address_zip: client?.address_zip || "",
      address_state: client?.address_state || "",
      address_country: client?.address_country || "MEX",
      tax_document: client?.tax_document || "",
      tax_system: client?.tax_system || "601",
      default_invoice_use: client?.default_invoice_use || "G01",
      status: client?.status ?? true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (client) {
        setFormData({
          code: client.code,
          name: client.name,
          description: client.description,
          phone: client.phone || "",
          email: client.email || "",
          address_street: client.address_street || "",
          address_exterior: client.address_exterior || "",
          address_interior: client.address_interior || "",
          address_neighborhood: client.address_neighborhood || "",
          address_city: client.address_city || "",
          address_municipality: client.address_municipality || "",
          address_zip: client.address_zip || "",
          address_state: client.address_state || "",
          address_country: client.address_country || "MEX",
          tax_document: client.tax_document || "",
          tax_system: client.tax_system || "601",
          default_invoice_use: client.default_invoice_use || "G01",
          status: client.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          phone: "",
          email: "",
          address_street: "",
          address_exterior: "",
          address_interior: "",
          address_neighborhood: "",
          address_city: "",
          address_municipality: "",
          address_zip: "",
          address_state: "",
          address_country: "MEX",
          tax_document: "",
          tax_system: "601",
          default_invoice_use: "G01",
          status: true,
        });
      }
    }, [client]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = t('form.errors.codeRequired');
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = t('form.errors.nameRequired');
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = t('form.errors.descriptionRequired');
        isValid = false;
      }

      if (!formData.tax_document.trim()) {
        newErrors.tax_document = t('form.errors.taxDocumentRequired');
        isValid = false;
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = t('form.errors.invalidEmail');
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange(true);
        const data = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address_street: formData.address_street.trim() || undefined,
          address_exterior: formData.address_exterior.trim() || undefined,
          address_interior: formData.address_interior.trim() || undefined,
          address_neighborhood: formData.address_neighborhood.trim() || undefined,
          address_city: formData.address_city.trim() || undefined,
          address_municipality: formData.address_municipality.trim() || undefined,
          address_zip: formData.address_zip.trim() || undefined,
          address_state: formData.address_state.trim() || undefined,
          address_country: formData.address_country.trim() || undefined,
          tax_document: formData.tax_document.trim(),
          tax_system: formData.tax_system.trim() || undefined,
          default_invoice_use: formData.default_invoice_use.trim() || undefined,
          status: formData.status,
        };

        if (client) {
          const res = await clientsService.updateClient(client.id, data);
          if (res.pack_sync_success) {
            toastService.success(t('messages.clientUpdated'));
          } else {
            toastService.error(
              t('messages.packSyncFailedUpdate', { detail: res.pack_sync_error ?? '' })
            );
          }
        } else {
          const res = await clientsService.createClient(data);
          if (res.pack_sync_success) {
            toastService.success(t('messages.clientCreated'));
          } else {
            toastService.error(
              t('messages.packSyncFailedCreate', { detail: res.pack_sync_error ?? '' })
            );
          }
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            client
              ? t('messages.errorUpdating')
              : t('messages.errorCreating')
          );
        }
      } finally {
        onSavingChange(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-2 grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <SurrogateInput
            label={t('form.code')}
            value={formData.code}
            onChange={(value) => setFormData((prev) => ({ ...prev, code: value }))}
            surrogateCode="client"
            placeholder={t('form.placeholders.code')}
            required
            error={errors.code}
            autoSuggest={!client} // Solo auto-sugerir para clientes nuevos
          />

          <Input
            type="text"
            id="tax_document"
            label={t('form.taxDocument')}
            required
            value={formData.tax_document}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tax_document: e.target.value }))
            }
            placeholder={t('form.placeholders.taxDocument')}
            error={errors.tax_document}
          />

          <Input
            type="text"
            id="name"
            label={t('form.name')}
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder={t('form.placeholders.name')}
            error={errors.name}
          />

          <TextArea
            id="description"
            label={t('form.description')}
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            placeholder={t('form.placeholders.description')}
            error={errors.description}
          />

          <Input
            type="text"
            id="phone"
            label={t('form.phone')}
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder={t('form.placeholders.phone')}
          />

          <Input
            type="email"
            id="email"
            label={t('form.email')}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder={t('form.placeholders.email')}
            error={errors.email}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              id="tax_system"
              label={t('form.taxSystem', { default: 'Régimen Fiscal' })}
              value={formData.tax_system}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tax_system: e.target.value }))
              }
              placeholder={t('form.placeholders.taxSystem', { default: 'Ej: 601' })}
            />
            <Input
              type="text"
              id="default_invoice_use"
              label={t('form.defaultInvoiceUse', { default: 'Uso de CFDI' })}
              value={formData.default_invoice_use}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, default_invoice_use: e.target.value }))
              }
              placeholder={t('form.placeholders.defaultInvoiceUse', { default: 'Ej: G01' })}
            />
          </div>

          <Checkbox
            id="status"
            label={t('form.active')}
            checked={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.checked }))
            }
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-[11px]" style={{ color: `rgb(var(--color-primary-500))` }}>
            {t('form.detailedAddress', { default: 'Dirección Detallada' })}
          </h3>
          <div className="space-y-6">
            <Input
              type="text"
              id="address_street"
              label={t('form.addressStreet', { default: 'Calle' })}
              value={formData.address_street}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address_street: e.target.value }))
              }
              placeholder={t('form.placeholders.addressStreet', { default: 'Ej: Blvd. Atardecer' })}
            />
            <Input
              type="text"
              id="address_neighborhood"
              label={t('form.addressNeighborhood', { default: 'Colonia' })}
              value={formData.address_neighborhood}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address_neighborhood: e.target.value }))
              }
              placeholder={t('form.placeholders.addressNeighborhood', { default: 'Ej: Centro' })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                id="address_exterior"
                label={t('form.addressExterior', { default: 'Número Exterior' })}
                value={formData.address_exterior}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_exterior: e.target.value }))
                }
                placeholder={t('form.placeholders.addressExterior', { default: 'Ej: 142' })}
              />
              <Input
                type="text"
                id="address_interior"
                label={t('form.addressInterior', { default: 'Número Interior' })}
                value={formData.address_interior}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_interior: e.target.value }))
                }
                placeholder={t('form.placeholders.addressInterior', { default: 'Ej: 4' })}
              />
              <Input
                type="text"
                id="address_city"
                label={t('form.addressCity', { default: 'Ciudad' })}
                value={formData.address_city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_city: e.target.value }))
                }
                placeholder={t('form.placeholders.addressCity', { default: 'Ej: Huatabampo' })}
              />
              <Input
                type="text"
                id="address_municipality"
                label={t('form.addressMunicipality', { default: 'Municipio' })}
                value={formData.address_municipality}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_municipality: e.target.value }))
                }
                placeholder={t('form.placeholders.addressMunicipality', { default: 'Ej: Huatabampo' })}
              />
              <Input
                type="text"
                id="address_zip"
                label={t('form.addressZip', { default: 'Código Postal' })}
                value={formData.address_zip}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_zip: e.target.value }))
                }
                placeholder={t('form.placeholders.addressZip', { default: 'Ej: 86500' })}
              />
              <Input
                type="text"
                id="address_state"
                label={t('form.addressState', { default: 'Estado' })}
                value={formData.address_state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_state: e.target.value }))
                }
                placeholder={t('form.placeholders.addressState', { default: 'Ej: Sonora' })}
              />
              <Input
                type="text"
                id="address_country"
                label={t('form.addressCountry', { default: 'País' })}
                value={formData.address_country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address_country: e.target.value }))
                }
                placeholder={t('form.placeholders.addressCountry', { default: 'Ej: MEX' })}
              />
            </div>
          </div>
        </div>
      </form>
    );
  }
);

ClientForm.displayName = "ClientForm";

export default ClientForm;
