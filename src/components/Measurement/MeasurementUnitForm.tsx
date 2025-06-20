import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { toastService } from '@/services/toast.service';
import { MeasurementUnit } from '@/types/measurement-unit';
import { Input, Checkbox } from '@/components/atoms';

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

    const validateForm = useCallback((): boolean => {
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
    }, [formData, onValidChange]);

    useEffect(() => {
      validateForm();
     // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateForm]);

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
        <Input
          type="text"
          id="code"
          label="Código"
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="Ej: Lts"
          error={errors.code}
        />

        <Input
          type="text"
          id="description"
          label="Descripción"
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ej: Litros"
          error={errors.description}
        />

        <div className="flex items-center">
          <Checkbox
            id="status"
            label="Activo"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
          />
        </div>
      </form>
    );
  }
);

MeasurementUnitForm.displayName = 'MeasurementUnitForm';

export default MeasurementUnitForm; 