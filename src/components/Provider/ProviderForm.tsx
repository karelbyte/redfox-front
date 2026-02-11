import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Provider } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Input, TextArea, Checkbox } from "@/components/atoms";
import { SurrogateInput } from "@/components/atoms/SurrogateInput";

export interface ProviderFormRef {
  submit: () => void;
}

interface ProviderFormProps {
  provider?: Provider | null;
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
  status: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  email?: string;
}

const ProviderForm = forwardRef<ProviderFormRef, ProviderFormProps>(
  ({ provider, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.providers');

    const [formData, setFormData] = useState<FormData>({
      code: provider?.code || "",
      name: provider?.name || "",
      description: provider?.description || "",
      phone: provider?.phone || "",
      email: provider?.email || "",
      status: provider?.status ?? true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (provider) {
        setFormData({
          code: provider.code,
          name: provider.name,
          description: provider.description,
          phone: provider.phone || "",
          email: provider.email || "",
          status: provider.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          phone: "",
          email: "",
          status: true,
        });
      }
    }, [provider]);

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

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
          status: formData.status,
        };

        if (provider) {
          const result = await providersService.updateProvider(provider.id, data);
          console.log('✏️ Provider updated:', result);
          toastService.success(t('messages.providerUpdated'));
        } else {
          const result = await providersService.createProvider(data);
          console.log('➕ Provider created:', result);
          toastService.success(t('messages.providerCreated'));
        }
        console.log('🎯 Calling onSuccess callback');
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            provider
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
        <SurrogateInput
          label={t('form.code')}
          value={formData.code}
          onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
          surrogateCode="provider"
          placeholder={t('form.placeholders.code')}
          required
          error={errors.code}
        />

        <Input
          type="text"
          id="name"
          label={t('form.name')}
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('form.placeholders.name')}
          error={errors.name}
        />

        <TextArea
          id="description"
          label={t('form.description')}
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder={t('form.placeholders.description')}
          error={errors.description}
        />

        <div className="grid grid-cols-1 gap-4">
          <Input
            type="text"
            id="phone"
            label={t('form.phone')}
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder={t('form.placeholders.phone')}
          />
        </div>

        <Input
          type="email"
          id="email"
          label={t('form.email')}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder={t('form.placeholders.email')}
          error={errors.email}
        />


        <Checkbox
          id="status"
          label={t('form.active')}
          checked={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
        />
      </form>
    );
  }
);

ProviderForm.displayName = "ProviderForm";

export default ProviderForm; 