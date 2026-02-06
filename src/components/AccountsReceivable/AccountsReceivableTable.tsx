"use client";

import { useTranslations } from 'next-intl';
import { AccountReceivable, AccountReceivableStatus } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface AccountsReceivableTableProps {
  accounts: AccountReceivable[];
  clients: Client[];
  isLoading: boolean;
  onEdit: (account: AccountReceivable) => void;
  onDelete: (account: AccountReceivable) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AccountsReceivableTable({ 
  accounts, 
  clients, 
  isLoading, 
  onEdit, 
  onDelete, 
  currentPage, 
  totalPages, 
  onPageChange 
}: AccountsReceivableTableProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || '';
  };

  const getStatusColor = (status: AccountReceivableStatus) => {
    switch (status) {
      case AccountReceivableStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AccountReceivableStatus.PARTIAL:
        return 'bg-blue-100 text-blue-800';
      case AccountReceivableStatus.PAID:
        return 'bg-green-100 text-green-800';
      case AccountReceivableStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case AccountReceivableStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.reference')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.client')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.totalAmount')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.remainingAmount')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.dueDate')}
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
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-primary-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.referenceNumber}</div>
                  {account.description && (
                    <div className="text-sm text-gray-500">{account.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getClientName(account.clientId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(account.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(account.remainingAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(account.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(account.status)}`}
                  >
                    {t(`status.${account.status.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(["account_receivable_update"]) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(account)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={tCommon('actions.edit')}
                      />
                    )}
                    {can(["account_receivable_delete"]) && (
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
              </tr>
            ))}
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
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