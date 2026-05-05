import { useLocale } from 'next-intl';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { Payroll } from '@/types/employee';
import { usePayrollTranslations } from './PayrollTranslations.i18n';
import Tooltip from "@/components/atoms/Tooltip";
import { Btn } from "@/components/atoms";

interface PayrollTableProps {
  payrollRecords: Payroll[];
  onEdit: (payroll: Payroll) => void;
  onDelete: (payroll: Payroll) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PayrollTable({
  payrollRecords,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: PayrollTableProps) {
  const locale = useLocale();
  const t = usePayrollTranslations(locale);
  const { can } = usePermissions();

  if (!Array.isArray(payrollRecords)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'paid':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {t('statuses.paid')}
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            {t('statuses.pending')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            {t('statuses.cancelled')}
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
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
                  checked={payrollRecords.length > 0 && selectedIds.length === payrollRecords.length}
                  onChange={onSelectAllChange}
                />
              </th>
              {isVisible('employee') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('employee')}
                </th>
              )}
              {isVisible('period') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('period')}
                </th>
              )}
              {isVisible('base_salary') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('baseSalary')}
                </th>
              )}
              {isVisible('net_pay') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('netPay')}
                </th>
              )}
              {isVisible('status') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('status')}
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary-600">
                {t('actionsTitle')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrollRecords.map((record) => (
              <tr key={record.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(record.id) ? 'bg-primary-50' : ''}`}>
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
                {isVisible('period') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                  </td>
                )}
                {isVisible('base_salary') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(record.base_salary)}
                  </td>
                )}
                {isVisible('net_pay') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {formatCurrency(record.net_pay)}
                  </td>
                )}
                {isVisible('status') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {can(["hr_payroll_update"]) && (
                      <Tooltip content={t('actions.edit')} placement="top">
                        <Btn
                          onClick={() => onEdit(record)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                        />
                      </Tooltip>
                    )}
                    {can(["hr_payroll_delete"]) && (
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
    </div>
  );
}
