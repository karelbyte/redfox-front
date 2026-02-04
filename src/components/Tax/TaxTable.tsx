'use client'

import { useTranslations } from 'next-intl';
import { Tax } from '@/types/tax';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { usePermissions } from '@/hooks/usePermissions';

interface TaxTableProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onDelete: (tax: Tax) => void;
  visibleColumns?: string[];
}

export default function TaxTable({ taxes, onEdit, onDelete, visibleColumns }: TaxTableProps) {
  const t = useTranslations('pages.taxes');
  const commonT = useTranslations('common');
  const { can } = usePermissions();

  if (!Array.isArray(taxes)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isVisible('code') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('form.code')}
              </th>
            )}
            {isVisible('name') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('form.name')}
              </th>
            )}
            {isVisible('rate') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.rate')}
              </th>
            )}
            {isVisible('type') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('taxType')}
              </th>
            )}
            {isVisible('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('form.status')}
              </th>
            )}
            {isVisible('actions') && (
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {taxes.map((tax) => (
            <tr key={tax.id} className="hover:bg-gray-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tax.code}</td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tax.name}</td>
              )}
              {isVisible('rate') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tax.type === 'PERCENTAGE' ? `${tax.value}%` : tax.value}
                </td>
              )}
              {isVisible('type') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tax.type === 'PERCENTAGE' ? 'Porcentaje' : 'Valor Fijo'}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tax.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {tax.isActive ? commonT('status.active') : commonT('status.inactive')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(["tax_update"]) && (
                      <Btn
                        onClick={() => onEdit(tax)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={commonT('actions.edit')}
                      />
                    )}
                    {can(["tax_delete"]) && (
                      <Btn
                        onClick={() => onDelete(tax)}
                        variant="ghost"
                        size="sm"
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