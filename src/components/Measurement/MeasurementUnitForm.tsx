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
  ({ unit, onClose, onSuccess, onSavingChange, onValidChange }, ref) => {
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
            placeholder="Ej: Lts"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-400 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
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
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-red-400">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

MeasurementUnitForm.displayName = 'MeasurementUnitForm';

export default MeasurementUnitForm; 