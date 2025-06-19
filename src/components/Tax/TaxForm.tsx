'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Tax, TaxType } from '@/types/tax';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { Input } from '@/components/atoms';

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

    // Estilos para el select con focus dinámico
    const getSelectStyles = () => ({
      appearance: 'none' as const,
      display: 'block',
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    });

    const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = `rgb(var(--color-primary-500))`;
      e.target.style.boxShadow = `0 0 0 1px rgba(var(--color-primary-500), 0.1)`;
    };

    const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    };

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

        <div>
          <label 
            htmlFor="type" 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            Tipo <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TaxType }))}
            onFocus={handleSelectFocus}
            onBlur={handleSelectBlur}
            style={getSelectStyles()}
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value={TaxType.PERCENTAGE}>Porcentaje (%)</option>
            <option value={TaxType.FIXED}>Valor Fijo</option>
          </select>
          {errors.type && <p className="mt-1 text-xs text-gray-300">{errors.type}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 border-gray-300 rounded"
            style={{
              accentColor: `rgb(var(--color-primary-500))`,
            }}
          />
          <label 
            htmlFor="isActive" 
            className="ml-2 block text-sm"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            Activo
          </label>
        </div>
      </form>
    );
  }
);

TaxForm.displayName = 'TaxForm';

export default TaxForm; 