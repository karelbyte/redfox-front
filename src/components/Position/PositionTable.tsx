"use client";

import { useLocale } from 'next-intl';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { Position } from '@/types/employee';
import { usePositionTranslations } from './PositionTranslations.i18n';
import { Btn, Tooltip } from "@/components/atoms";

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (checked: boolean) => void;
}

export default function PositionTable({
  positions,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: PositionTableProps) {
  const locale = useLocale();
  const t = usePositionTranslations(locale);
  const { can } = usePermissions();

  if (!Array.isArray(positions)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const isAllSelected = positions.length > 0 && selectedIds.length === positions.length;

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
            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                checked={isAllSelected}
                onChange={(e) => onSelectAllChange && onSelectAllChange(e.target.checked)}
              />
            </th>
            {isVisible('title') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('title_col')}
              </th>
            )}
            {isVisible('department') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('department')}
              </th>
            )}
            {isVisible('salary_range') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('salaryRange')}
              </th>
            )}
            {isVisible('employee_count') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('employees')}
              </th>
            )}
            {isVisible('created_at') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('date')}
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
              {t('actions.title')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {positions.map((pos) => (
            <tr key={pos.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(pos.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(pos.id)}
                  onChange={() => onSelectChange && onSelectChange(pos.id)}
                />
              </td>
              {isVisible('title') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {pos.title}
                </td>
              )}
              {isVisible('department') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pos.department?.name || '-'}
                </td>
              )}
              {isVisible('salary_range') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pos.min_salary && pos.max_salary ? `${pos.min_salary} - ${pos.max_salary}` : '-'}
                </td>
              )}
              {isVisible('employee_count') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                  {pos._count?.employees || 0}
                </td>
              )}
              {isVisible('created_at') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pos.created_at).toLocaleDateString()}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {can(["hr_position_update"]) && (
                    <Tooltip content={t('actions.edit')} placement="top">
                      <Btn
                        onClick={() => onEdit(pos)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                      />
                    </Tooltip>
                  )}
                  {can(["hr_position_delete"]) && (
                    <Tooltip content={t('actions.delete')} placement="top">
                      <Btn
                        onClick={() => onDelete(pos)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        style={{ color: "#dc2626" }}
                      />
                    </Tooltip>
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
