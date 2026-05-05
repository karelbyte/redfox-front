"use client";

import { useLocale } from 'next-intl';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { Attendance } from '@/types/employee';
import { Btn, Tooltip } from '@/components/atoms';
import { useAttendanceTranslations } from './AttendanceTranslations.i18n';

interface AttendanceTableProps {
  attendance: Attendance[];
  onEdit: (attendance: Attendance) => void;
  onDelete: (attendance: Attendance) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (checked: boolean) => void;
}

const STATUS_STYLES: Record<string, string> = {
  present:  'bg-green-100 text-green-800',
  PRESENT:  'bg-green-100 text-green-800',
  late:     'bg-yellow-100 text-yellow-800',
  LATE:     'bg-yellow-100 text-yellow-800',
  absent:   'bg-red-100 text-red-800',
  ABSENT:   'bg-red-100 text-red-800',
  half_day: 'bg-blue-100 text-blue-800',
  HALF_DAY: 'bg-blue-100 text-blue-800',
};

export default function AttendanceTable({
  attendance,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange,
}: AttendanceTableProps) {
  const locale = useLocale();
  const t = useAttendanceTranslations(locale);
  const { can } = usePermissions();

  if (!Array.isArray(attendance)) return null;

  const isVisible = (key: string) => !visibleColumns || visibleColumns.includes(key);
  const isAllSelected = attendance.length > 0 && selectedIds.length === attendance.length;

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      present: t('present'), PRESENT: t('present'),
      absent:  t('absent'),  ABSENT:  t('absent'),
      late:    t('late'),    LATE:    t('late'),
      half_day: t('halfDay'), HALF_DAY: t('halfDay'),
    };
    return map[status] ?? status;
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`,
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
            {isVisible('employee') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('employee')}
              </th>
            )}
            {isVisible('date') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('date')}
              </th>
            )}
            {isVisible('check_in') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('checkIn')}
              </th>
            )}
            {isVisible('check_out') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('checkOut')}
              </th>
            )}
            {isVisible('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                {t('status')}
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
              {t('actions.title')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendance.map((record) => (
            <tr
              key={record.id}
              className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(record.id) ? 'bg-primary-50' : ''}`}
            >
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(record.id)}
                  onChange={() => onSelectChange && onSelectChange(record.id)}
                />
              </td>
              {isVisible('employee') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : '-'}
                </td>
              )}
              {isVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </td>
              )}
              {isVisible('check_in') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
              )}
              {isVisible('check_out') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[record.status] ?? 'bg-gray-100 text-gray-800'}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {can(["hr_attendance_update"]) && (
                    <Tooltip content={t('actions.edit')} placement="top">
                      <Btn
                        onClick={() => onEdit(record)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                      />
                    </Tooltip>
                  )}
                  {can(["hr_attendance_delete"]) && (
                    <Tooltip content={t('actions.delete')} placement="top">
                      <Btn
                        onClick={() => onDelete(record)}
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
