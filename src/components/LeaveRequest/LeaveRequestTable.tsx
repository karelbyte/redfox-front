import { useLocale } from 'next-intl';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { LeaveRequest } from '@/types/employee';
import { useLeaveRequestTranslations } from './LeaveRequestTranslations.i18n';
import Tooltip from "@/components/atoms/Tooltip";
import { Btn } from "@/components/atoms";

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  onEdit: (leaveRequest: LeaveRequest) => void;
  onDelete: (leaveRequest: LeaveRequest) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LeaveRequestTable({
  leaveRequests,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: LeaveRequestTableProps) {
  const locale = useLocale();
  const t = useLeaveRequestTranslations(locale);
  const { can } = usePermissions();

  if (!Array.isArray(leaveRequests)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'APPROVED':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {t('statuses.approved')}
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            {t('statuses.pending')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            {t('statuses.rejected')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatLeaveType = (type: string) => {
    return t(`types.${type.toLowerCase()}`);
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={leaveRequests.length > 0 && selectedIds.length === leaveRequests.length}
                  onChange={onSelectAllChange}
                />
              </th>
              {isVisible('employee') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('employee')}
                </th>
              )}
              {isVisible('leave_type') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('leaveType')}
                </th>
              )}
              {isVisible('dates') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('dates')}
                </th>
              )}
              {isVisible('days_count') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600 text-center">
                  {t('days')}
                </th>
              )}
              {isVisible('status') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('status')}
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary-600">
                {t('actions.title')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveRequests.map((request) => (
              <tr key={request.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(request.id) ? 'bg-primary-50' : ''}`}>
                <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                    checked={selectedIds.includes(request.id)}
                    onChange={() => onSelectChange && onSelectChange(request.id)}
                  />
                </td>
                {isVisible('employee') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {request.employee ? `${request.employee.first_name} ${request.employee.last_name}` : '-'}
                  </td>
                )}
                {isVisible('leave_type') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLeaveType(request.leave_type)}
                  </td>
                )}
                {isVisible('dates') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </td>
                )}
                {isVisible('days_count') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {request.days_count}
                  </td>
                )}
                {isVisible('status') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {can(["hr_leave_request_update"]) && (
                      <Tooltip content={t('actions.edit')} placement="top">
                        <Btn
                          onClick={() => onEdit(request)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                        />
                      </Tooltip>
                    )}
                    {can(["hr_leave_request_delete"]) && (
                      <Tooltip content={t('actions.delete')} placement="top">
                        <Btn
                          onClick={() => onDelete(request)}
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
    </div>
  );
}
