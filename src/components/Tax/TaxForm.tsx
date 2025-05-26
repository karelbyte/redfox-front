'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Tax, TaxType } from '@/types/tax';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';

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

interface TaxFormProps {
  initialData?: Tax;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface TaxFormRef {
  submit: () => void;
}

const TaxForm = forwardRef<TaxFormRef, TaxFormProps>(
  ({ initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<TaxFormData>({
      code: initialData?.code || '',
      name: initialData?.name || '',
      value: initialData?.value || 0,
      type: initialData?.type || 'PERCENTAGE',
      isActive: initialData?.isActive ?? true,
    });

    const [errors, setErrors] = useState<TaxFormErrors>({});

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
          type: 'PERCENTAGE',
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
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-red-400 mb-2">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: IVA"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-red-400 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Impuesto al Valor Agregado"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-red-400 mb-2">
            Valor <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: 20"
            step="0.01"
            min="0"
            required
          />
          {errors.value && <p className="mt-1 text-xs text-gray-300">{errors.value}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-red-400 mb-2">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TaxType }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            required
          >
            <option value="PERCENTAGE">Porcentaje</option>
            <option value="FIXED">Valor Fijo</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-red-400">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

TaxForm.displayName = 'TaxForm';

export default TaxForm; 