"use client";

import { Employee } from "@/types/employee";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEmployeeTranslations } from "./useEmployeeTranslations.i18n";
import { usePermissions } from "@/hooks/usePermissions";
import { Btn, Tooltip } from "@/components/atoms";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  visibleColumns: string[];
  selectedIds: string[];
  onSelectChange: (id: string) => void;
  onSelectAllChange: (checked: boolean) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds,
  onSelectChange,
  onSelectAllChange
}: EmployeeTableProps) {
  const t = useEmployeeTranslations();
  const { can } = usePermissions();

  if (!Array.isArray(employees)) {
    return null;
  }

  const isAllSelected = employees.length > 0 && selectedIds.length === employees.length;

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
                onChange={(e) => onSelectAllChange(e.target.checked)}
              />
            </th>
            {visibleColumns.includes('employee_code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("employeeCode")}
              </th>
            )}
            {visibleColumns.includes('first_name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("firstName")}
              </th>
            )}
            {visibleColumns.includes('last_name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("lastName")}
              </th>
            )}
            {visibleColumns.includes('email') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("email")}
              </th>
            )}
            {visibleColumns.includes('phone') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("phone")}
              </th>
            )}
            {visibleColumns.includes('department') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("department")}
              </th>
            )}
            {visibleColumns.includes('position') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("position")}
              </th>
            )}
            {visibleColumns.includes('status') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("status")}
              </th>
            )}
            {visibleColumns.includes('hire_date') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("hireDate")}
              </th>
            )}
            {visibleColumns.includes('actions') && (
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t("actions.title")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(employee.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                {selectedIds.includes(employee.id) && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                )}
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(employee.id)}
                  onChange={() => onSelectChange(employee.id)}
                />
              </td>
              {visibleColumns.includes('employee_code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {employee.employee_code}
                </td>
              )}
              {visibleColumns.includes('first_name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.first_name}
                </td>
              )}
              {visibleColumns.includes('last_name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.last_name}
                </td>
              )}
              {visibleColumns.includes('email') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.email || '-'}
                </td>
              )}
              {visibleColumns.includes('phone') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.phone || '-'}
                </td>
              )}
              {visibleColumns.includes('department') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department?.name || '-'}
                </td>
              )}
              {visibleColumns.includes('position') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position?.title || '-'}
                </td>
              )}
              {visibleColumns.includes('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status === 'active' ? t("active") : t("inactive")}
                  </span>
                </td>
              )}
              {visibleColumns.includes('hire_date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </td>
              )}
              {visibleColumns.includes('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {can(["hr_employee_update"]) && (
                      <Tooltip content={t("actions.edit")} placement="top">
                        <Btn
                          onClick={() => onEdit(employee)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                        />
                      </Tooltip>
                    )}
                    {can(["hr_employee_delete"]) && onDelete && (
                      <Tooltip content={t("actions.delete")} placement="top">
                        <Btn
                          onClick={() => onDelete(employee)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<TrashIcon className="h-4 w-4" />}
                          style={{ color: "#dc2626" }}
                        />
                      </Tooltip>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

