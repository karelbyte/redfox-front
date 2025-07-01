import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Input, TextArea, Checkbox } from "@/components/atoms";

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
  address: string;
  tax_document: string;
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
      address: client?.address || "",
      tax_document: client?.tax_document || "",
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
          address: client.address || "",
          tax_document: client.tax_document || "",
          status: client.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          phone: "",
          email: "",
          address: "",
          tax_document: "",
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
          address: formData.address.trim(),
          tax_document: formData.tax_document.trim(),
          status: formData.status,
          updated_at: new Date().toISOString(),
          deleted_at: null,
        };

        if (client) {
          await clientsService.updateClient(client.id, data);
          toastService.success(t('messages.clientUpdated'));
        } else {
          await clientsService.createClient(data);
          toastService.success(t('messages.clientCreated'));
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
      <form className="space-y-6">
        <Input
          type="text"
          id="code"
          label={t('form.code')}
          required
          value={formData.code}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, code: e.target.value }))
          }
          placeholder={t('form.placeholders.code')}
          error={errors.code}
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

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <TextArea
          id="address"
          label={t('form.address')}
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          rows={3}
          placeholder={t('form.placeholders.address')}
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

        <Checkbox
          id="status"
          label={t('form.active')}
          checked={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.checked }))
          }
        />
      </form>
    );
  }
);

ClientForm.displayName = "ClientForm";

export default ClientForm;
