'use client'

import { useTranslations } from 'next-intl';
import { Currency } from '@/types/currency';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface CurrencyTableProps {
  currencies: Currency[];
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
  visibleColumns?: string[];
}

export default function CurrencyTable({ currencies, onEdit, onDelete, visibleColumns }: CurrencyTableProps) {
  const t = useTranslations('pages.currencies');
  const commonT = useTranslations('common');
  const { can } = usePermissions();

  if (!Array.isArray(currencies)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

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
                {t('form.code')}
              </th>
            )}
            {isVisible('name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('form.name')}
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
          {currencies.map((currency) => (
            <tr key={currency.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currency.code}</td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currency.name}</td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(['currency_update']) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(currency)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={commonT('actions.edit')}
                      />
                    )}
                    {can(['currency_delete']) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(currency)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={commonT('actions.delete')}
                        style={{ color: '#dc2626' }}
                      />
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
