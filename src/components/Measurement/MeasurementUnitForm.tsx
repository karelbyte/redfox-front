import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { toastService } from '@/services/toast.service';
import { MeasurementUnit } from '@/types/measurement-unit';

export interface MeasurementUnitFormProps {
  unit: MeasurementUnit | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface MeasurementUnitFormRef {
  submit: () => void;
}

interface FormData {
  code: string;
  description: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  description?: string;
}

const MeasurementUnitForm = forwardRef<MeasurementUnitFormRef, MeasurementUnitFormProps>(
  ({ unit, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      code: '',
      description: '',
      status: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (unit) {
        setFormData({
          code: unit.code,
          description: unit.description,
          status: unit.status,
        });
      } else {
        setFormData({
          code: '',
          description: '',
          status: true,
        });
      }
    }, [unit]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
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
          code: formData.code.trim(),
          description: formData.description.trim(),
          status: formData.status,
        };

        if (unit) {
          await measurementUnitsService.updateMeasurementUnit(unit.id, data);
          toastService.success('Unidad de medida actualizada correctamente');
        } else {
          await measurementUnitsService.createMeasurementUnit(data);
          toastService.success('Unidad de medida creada correctamente');
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar la unidad de medida');
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    // Estilos para los inputs con focus dinámico
    const getInputStyles = () => ({
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

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = `rgb(var(--color-primary-500))`;
      e.target.style.boxShadow = `0 0 0 1px rgba(var(--color-primary-500), 0.1)`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    };

    return (
      <form className="space-y-6">
        <div>
          <label 
            htmlFor="code" 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            Código <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={getInputStyles()}
            placeholder="Ej: Lts"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            Descripción <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={getInputStyles()}
            placeholder="Ej: Litros"
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
            className="h-4 w-4 border-gray-300 rounded"
            style={{
              accentColor: `rgb(var(--color-primary-500))`,
            }}
          />
          <label 
            htmlFor="status" 
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

MeasurementUnitForm.displayName = 'MeasurementUnitForm';

export default MeasurementUnitForm; 