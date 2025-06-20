'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Tax, TaxType } from '@/types/tax';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { Input, Select, Checkbox } from '@/components/atoms';

interface TaxFormData {
  code: string;
  name: string;
  value: number;
  type: TaxType;
  isActive: boolean;
}

interface TaxFormErrors {
  code?: string;
  name?: string;
  value?: string;
  type?: string;
  isActive?: string;
}

export interface TaxFormProps {
  initialData: Tax | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface TaxFormRef {
  save: () => void;
}

const TaxForm = forwardRef<TaxFormRef, TaxFormProps>(
  ({ initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<TaxFormData>({
      code: initialData?.code || '',
      name: initialData?.name || '',
      value: initialData?.value || 0,
      type: initialData?.type || TaxType.PERCENTAGE,
      isActive: initialData?.isActive ?? true,
    });

    const [errors, setErrors] = useState<TaxFormErrors>({});

    const taxTypeOptions = [
      { value: TaxType.PERCENTAGE, label: 'Porcentaje (%)' },
      { value: TaxType.FIXED, label: 'Valor Fijo' },
    ];

    useEffect(() => {
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.name,
          value: initialData.value,
          type: initialData.type,
          isActive: initialData.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          value: 0,
          type: TaxType.PERCENTAGE,
          isActive: true,
        });
      }
    }, [initialData]);

    const validateForm = (): boolean => {
      const newErrors: Partial<TaxFormErrors> = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
        isValid = false;
      }

      if (formData.value === undefined || formData.value === null) {
        newErrors.value = 'El valor es requerido';
        isValid = false;
      } else if (formData.value < 0) {
        newErrors.value = 'El valor debe ser un número positivo';
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
          await api.put(`/taxes/${initialData.id}`, data);
          toastService.success('Impuesto actualizado correctamente');
        } else {
          await api.post('/taxes', data);
          toastService.success('Impuesto creado correctamente');
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar el impuesto');
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: handleSubmit,
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
          placeholder="Ej: IVA"
          error={errors.code}
        />

        <Input
          type="text"
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Impuesto al Valor Agregado"
          error={errors.name}
        />

        <Input
          type="number"
          id="value"
          label="Valor"
          required
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
          placeholder="Ej: 19"
          min="0"
          step="0.01"
          error={errors.value}
        />

        <Select
          id="type"
          label="Tipo"
          required
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TaxType }))}
          options={taxTypeOptions}
          placeholder="Seleccione un tipo"
          error={errors.type}
        />

        <Checkbox
          id="isActive"
          label="Activo"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          error={errors.isActive}
        />
      </form>
    );
  }
);

TaxForm.displayName = 'TaxForm';

export default TaxForm; 