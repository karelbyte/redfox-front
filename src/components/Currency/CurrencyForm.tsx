'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface CurrencyFormRef {
  submit: () => void;
}

const CurrencyForm = forwardRef<CurrencyFormRef, CurrencyFormProps>(
  ({ initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
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
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
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
          await api.put(`/currencies/${initialData.id}`, data);
          toastService.success('Moneda actualizada correctamente');
        } else {
          await api.post('/currencies', data);
          toastService.success('Moneda creada correctamente');
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar la moneda');
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
          label="Código"
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="Ej: USD"
          error={errors.code}
        />

        <Input
          type="text"
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Dólar Estadounidense"
          error={errors.name}
        />
      </form>
    );
  }
);

CurrencyForm.displayName = 'CurrencyForm';

export default CurrencyForm; 