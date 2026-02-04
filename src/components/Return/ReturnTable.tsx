'use client';

import { useTranslations } from 'next-intl';
import { Return } from '@/types/return';
import { Btn } from '@/components/atoms';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ReturnTableProps {
  returns: Return[];
  onEdit: (returnItem: Return) => void;
  onDelete: (returnItem: Return) => void;
  onDetails: (returnItem: Return) => void;
  onClose: (returnItem: Return) => void;
  visibleColumns?: string[];
}

export default function ReturnTable({
  returns,
  onEdit,
  onDelete,
  onDetails,
  onClose,
  visibleColumns,
}: ReturnTableProps) {
  const t = useTranslations('pages.returns');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isVisible('code') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.code')}
              </th>
            )}
            {isVisible('sourceWarehouse') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.sourceWarehouse')}
              </th>
            )}
            {isVisible('targetProvider') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.targetProvider')}
              </th>
            )}
            {isVisible('date') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.date')}
              </th>
            )}
            {isVisible('description') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.description')}
              </th>
            )}
            {isVisible('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.status')}
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
          {returns.map((returnItem) => (
            <tr key={returnItem.id} className="hover:bg-gray-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{returnItem.code}</div>
                </td>
              )}
              {isVisible('sourceWarehouse') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{returnItem.sourceWarehouse.name}</div>
                  <div className="text-sm text-gray-500">{returnItem.sourceWarehouse.code}</div>
                </td>
              )}
              {isVisible('targetProvider') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{returnItem.targetProvider.name}</div>
                  <div className="text-sm text-gray-500">{returnItem.targetProvider.code}</div>
                </td>
              )}
              {isVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(returnItem.date)}
                </td>
              )}
              {isVisible('description') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={returnItem.description}>
                    {returnItem.description}
                  </div>
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${returnItem.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {returnItem.status ? t('status.closed') : t('status.open')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDetails(returnItem)}
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />
                    {!returnItem.status && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onClose(returnItem)}
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        title={t('actions.close')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(returnItem)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={returnItem.status ? t('actions.cannotEditClosed') : t('actions.edit')}
                      disabled={returnItem.status}
                      className={returnItem.status ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(returnItem)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={returnItem.status ? t('actions.cannotDeleteClosed') : t('actions.delete')}
                      disabled={returnItem.status}
                      className={returnItem.status ? 'opacity-50 cursor-not-allowed' : ''}
                      style={{ color: returnItem.status ? '#9ca3af' : '#dc2626' }}
                    />
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