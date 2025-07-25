import { useTranslations } from 'next-intl';
import { MeasurementUnit } from '@/types/measurement-unit';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface MeasurementUnitTableProps {
  units: MeasurementUnit[];
  onEdit: (unit: MeasurementUnit) => void;
  onDelete: (unit: MeasurementUnit) => void;
}

export default function MeasurementUnitTable({ units, onEdit, onDelete }: MeasurementUnitTableProps) {
  const t = useTranslations('pages.measurementUnits');
  const commonT = useTranslations('common');
  const { can } = usePermissions();

  if (!Array.isArray(units)) {
    return null;
  }

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden"
      style={{ 
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.code')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.description')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.status')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {units.map((unit) => (
            <tr key={unit.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.description}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    unit.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {unit.status ? commonT('status.active') : commonT('status.inactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {can(["measurement_unit_update"]) && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(unit)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={commonT('actions.edit')}
                    />
                  )}
                  {can(["measurement_unit_delete"]) && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(unit)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={commonT('actions.delete')}
                      style={{ color: '#dc2626' }}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 