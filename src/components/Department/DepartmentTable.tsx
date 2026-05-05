"use client";

import { useLocale } from 'next-intl';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { Department } from '@/types/employee';
import { useDepartmentTranslations } from './DepartmentTranslations.i18n';
import { Btn, Tooltip } from "@/components/atoms";

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (checked: boolean) => void;
}

export default function DepartmentTable({
  departments,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: DepartmentTableProps) {
  const locale = useLocale();
  const t = useDepartmentTranslations(locale);
  const { can } = usePermissions();

  if (!Array.isArray(departments)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const isAllSelected = departments.length > 0 && selectedIds.length === departments.length;

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
            {isVisible('name') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('name')}
              </th>
            )}
            {isVisible('description') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('deptDescription')}
              </th>
            )}
            {isVisible('manager') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('manager')}
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
          {departments.map((dept) => (
            <tr key={dept.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(dept.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(dept.id)}
                  onChange={() => onSelectChange && onSelectChange(dept.id)}
                />
              </td>
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {dept.name}
                </td>
              )}
              {isVisible('description') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dept.description || '-'}
                </td>
              )}
              {isVisible('manager') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : '-'}
                </td>
              )}
              {isVisible('employee_count') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {dept._count?.employees || 0}
                </td>
              )}
              {isVisible('created_at') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(dept.created_at).toLocaleDateString()}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {can(["hr_department_update"]) && (
                    <Tooltip content={t('actions.edit')} placement="top">
                      <Btn
                        onClick={() => onEdit(dept)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                      />
                    </Tooltip>
                  )}
                  {can(["hr_department_delete"]) && (
                    <Tooltip content={t('actions.delete')} placement="top">
                      <Btn
                        onClick={() => onDelete(dept)}
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
