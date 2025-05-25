import { MeasurementUnit } from '@/types/measurement-unit';

interface DeleteMeasurementUnitModalProps {
  unit: MeasurementUnit | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMeasurementUnitModal({ unit, onClose, onConfirm }: DeleteMeasurementUnitModalProps) {
  if (!unit) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Confirmar Eliminación</h2>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro que deseas eliminar la unidad de medida &quot;{unit.description}&quot;?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
} 