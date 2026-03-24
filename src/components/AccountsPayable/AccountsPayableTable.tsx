"use client";

import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';
import { PencilIcon, TrashIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { usePermissions } from '@/hooks/usePermissions';

interface AccountsPayableTableProps {
  accounts: AccountPayable[];
  isLoading?: boolean;
  onEdit: (account: AccountPayable) => void;
  onDelete: (account: AccountPayable) => void;
  onRegisterPayment: (account: AccountPayable) => void;
  onViewPayments: (account: AccountPayable) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  visibleColumns?: string[];
}

export default function AccountsPayableTable({
  accounts,
  isLoading,
  onEdit,
  onDelete,
  onRegisterPayment,
  onViewPayments,
  currentPage,
  totalPages,
  onPageChange,
  visibleColumns,
}: AccountsPayableTableProps) {
  const t = useTranslations('accountsPayable');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const { formatCurrency } = useLocaleUtils();

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const getStatusColor = (status: AccountPayableStatus) => {
    switch (status) {
      case AccountPayableStatus.PAID:
        return 'bg-green-100 text-green-800';
      case AccountPayableStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AccountPayableStatus.PARTIAL:
        return 'bg-blue-100 text-blue-800';
      case AccountPayableStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case AccountPayableStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AccountPayableStatus) => {
    return t(`status.${status.toLowerCase()}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{
          boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
        }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isVisible('referenceNumber') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.referenceNumber')}
                </th>
              )}
              {isVisible('provider') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.provider')}
                </th>
              )}
              {isVisible('totalAmount') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.totalAmount')}
                </th>
              )}
              {isVisible('remainingAmount') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.remainingAmount')}
                </th>
              )}
              {isVisible('dueDate') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.dueDate')}
                </th>
              )}
              {isVisible('status') && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.status')}
                </th>
              )}
              {isVisible('actions') && (
                <th
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('table.actions_title')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts && accounts.length > 0 ? accounts.map((account) => (
              <tr key={account.id} className="hover:bg-primary-50 transition-colors">
                {isVisible('referenceNumber') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.referenceNumber}</div>
                  </td>
                )}
                {isVisible('provider') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.provider ? `${account.provider.code} - ${account.provider.name}` : '-'}
                  </td>
                )}
                {isVisible('totalAmount') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(account.totalAmount))}
                  </td>
                )}
                {isVisible('remainingAmount') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(account.remainingAmount))}
                  </td>
                )}
                {isVisible('dueDate') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(account.dueDate)}
                  </td>
                )}
                {isVisible('status') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                      {getStatusLabel(account.status)}
                    </span>
                  </td>
                )}
                {isVisible('actions') && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPayments(account)}
                        leftIcon={<ClockIcon className="h-4 w-4" />}
                        title={t('table.actions.viewPayments')}
                      />
                      {account.status !== AccountPayableStatus.PAID && account.status !== AccountPayableStatus.CANCELLED && (
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => onRegisterPayment(account)}
                          leftIcon={<BanknotesIcon className="h-4 w-4 text-green-600" />}
                          title={t('registerPayment')}
                        />
                      )}
                     {account.status !== AccountPayableStatus.PAID && account.status !== AccountPayableStatus.CANCELLED && (  <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(account)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={tCommon('actions.edit')}
                      />)}
                      {Number(account.paidAmount) === 0 && (
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(account)}
                          leftIcon={<TrashIcon className="h-4 w-4" />}
                          title={tCommon('actions.delete')}
                          style={{ color: '#dc2626' }}
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {t('empty.description')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Btn
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {tCommon('pagination.previous')}
            </Btn>
            <Btn
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {tCommon('pagination.next')}
            </Btn>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {tCommon('pagination.showing')} <span className="font-medium">{currentPage}</span> {tCommon('pagination.of')} <span className="font-medium">{totalPages}</span> {tCommon('pagination.pages')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tCommon('pagination.previous')}
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tCommon('pagination.next')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
