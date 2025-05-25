import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { toastService } from '@/services/toast.service';
import { MeasurementUnit } from '@/types/measurement-unit';

export interface MeasurementUnitFormProps {
  unit: MeasurementUnit | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
}

export interface MeasurementUnitFormRef {
  submit: () => void;
}

const MeasurementUnitForm = forwardRef<MeasurementUnitFormRef, MeasurementUnitFormProps>(
  ({ unit, onClose, onSuccess, onSavingChange }, ref) => {
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(true);

    useEffect(() => {
      if (unit) {
        setCode(unit.code);
        setDescription(unit.description);
        setStatus(unit.status);
      } else {
        setCode('');
        setDescription('');
        setStatus(true);
      }
    }, [unit]);

    const handleSubmit = async () => {
      try {
        onSavingChange?.(true);
        const data = {
          code,
          description,
          status,
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
            Código
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Lts"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-400 mb-2">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Litros"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
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