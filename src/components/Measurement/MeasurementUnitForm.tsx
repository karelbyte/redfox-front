import { useState, useEffect } from 'react';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { toastService } from '@/services/toast.service';

interface MeasurementUnit {
  id: string;
  code: string;
  description: string;
  status: boolean;
}

interface MeasurementUnitFormProps {
  unit?: MeasurementUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MeasurementUnitForm({ unit, onClose, onSuccess }: MeasurementUnitFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    status: true,
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code,
        description: unit.description,
        status: unit.status,
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (unit) {
        await measurementUnitsService.updateMeasurementUnit(unit.id, formData);
        toastService.success('Unidad de medida actualizada correctamente');
      } else {
        await measurementUnitsService.createMeasurementUnit(formData);
        toastService.success('Unidad de medida creada correctamente');
      }
      onSuccess();
    } catch (error) {
      toastService.error('Error al guardar la unidad de medida');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <input
          type="text"
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="status"
          checked={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
          Activo
        </label>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
} 