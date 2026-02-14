'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Currency } from '@/types/currency';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { Input } from '@/components/atoms';

interface CurrencyFormData {
  code: string;
  name: string;
}

interface CurrencyFormErrors {
  code?: string;
  name?: string;
}

export interface CurrencyFormProps {
  initialData: Currency | null;
  onClose: () => void;
  onSuccess: (currency?: Currency) => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface CurrencyFormRef {
  submit: () => void;
}

const CurrencyForm = forwardRef<CurrencyFormRef, CurrencyFormProps>(
  ({ initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.currencies');
    const [formData, setFormData] = useState<CurrencyFormData>({
      code: initialData?.code || '',
      name: initialData?.name || '',
    });

    const [errors, setErrors] = useState<CurrencyFormErrors>({});

    useEffect(() => {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.name,
        });
      } else {
        setFormData({
          code: '',
          name: '',
        });
      }
    }, [initialData]);

    const validateForm = (): boolean => {
      const newErrors: Partial<CurrencyFormErrors> = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = t('form.errors.codeRequired');
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = t('form.errors.nameRequired');
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
        onSavingChange?.(true);
        const data = {
          ...formData,
          code: formData.code.trim(),
          name: formData.name.trim(),
        };

        if (initialData) {
          const response = await api.put<Currency>(`/currencies/${initialData.id}`, data);
          toastService.success(t('messages.currencyUpdated'));
          onSuccess(response);
        } else {
          const response = await api.post<Currency>('/currencies', data);
          toastService.success(t('messages.currencyCreated'));
          onSuccess(response);
        }
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(initialData ? t('messages.errorUpdating') : t('messages.errorCreating'));
        }
      } finally {
        onSavingChange?.(false);
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
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder={t('form.placeholders.code')}
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
      </form>
    );
  }
);

CurrencyForm.displayName = 'CurrencyForm';

export default CurrencyForm; 