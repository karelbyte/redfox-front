'use client'

import { useTranslations, useLocale } from 'next-intl';
import { CashRegister } from '@/types/cash-register';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import ActionsMenu, { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { usePermissions } from '@/hooks/usePermissions';
import Tooltip from '@/components/atoms/Tooltip';

interface CashRegisterTableProps {
  cashRegisters: CashRegister[];
  visibleColumns?: string[];
  onEdit?: (cashRegister: CashRegister) => void;
  onDelete?: (cashRegister: CashRegister) => void;
  onView?: (cashRegister: CashRegister) => void;
}

export default function CashRegisterTable({
  cashRegisters,
  visibleColumns,
  onEdit,
  onDelete,
  onView,
}: CashRegisterTableProps) {
  const t = useTranslations('pages.cashRegisters');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { can } = usePermissions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  if (!Array.isArray(cashRegisters)) {
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
            {isVisible('code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {isVisible('name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.name')}
              </th>
            )}
            {isVisible('current_amount') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.currentAmount')}
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
            {isVisible('openedAt') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.openedAt')}
              </th>
            )}
            {isVisible('openedBy') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.openedBy')}
              </th>
            )}
            {isVisible('actions') && (
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cashRegisters.map((cashRegister) => (
            <tr key={cashRegister.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cashRegister.code}
                </td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cashRegister.name}
                </td>
              )}
              {isVisible('current_amount') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(cashRegister.current_amount)}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cashRegister.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cashRegister.status === 'open' ? t('table.statusOpen') : t('table.statusClosed')}
                  </span>
                </td>
              )}
              {isVisible('openedAt') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(cashRegister.opened_at)}
                </td>
              )}
              {isVisible('openedBy') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cashRegister.opened_by}
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <CashRegisterActionsMenu
                    cashRegister={cashRegister}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CashRegisterActionsMenuProps {
  cashRegister: CashRegister;
  onEdit?: (cashRegister: CashRegister) => void;
  onDelete?: (cashRegister: CashRegister) => void;
  onView?: (cashRegister: CashRegister) => void;
}

function CashRegisterActionsMenu({
  cashRegister,
  onEdit,
  onDelete,
  onView,
}: CashRegisterActionsMenuProps) {
  const t = useTranslations('pages.cashRegisters');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();

  const menuItems: ActionMenuItem[] = [
    {
      icon: <EyeIcon className="h-4 w-4" />,
      label: t('actions.view'),
      color: '#0891b2',
      onClick: () => {
        onView && onView(cashRegister);
      },
    },
    ...(can(['cash_registers_update'])
      ? [
          {
            icon: <PencilIcon className="h-4 w-4" />,
            label: tCommon('actions.edit'),
            onClick: () => {
              onEdit && onEdit(cashRegister);
            },
          },
        ]
      : []),
    ...(can(['cash_registers_delete'])
      ? [
          {
            icon: <TrashIcon className="h-4 w-4" />,
            label: tCommon('actions.delete'),
            color: '#dc2626',
            onClick: () => {
              onDelete && onDelete(cashRegister);
            },
          },
        ]
      : []),
  ];

  return <ActionsMenu items={menuItems} />;
}
