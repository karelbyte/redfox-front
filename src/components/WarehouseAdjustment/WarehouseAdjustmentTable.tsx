'use client';

import { useTranslations } from 'next-intl';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import { Btn } from '@/components/atoms';
import { EyeIcon, TrashIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface WarehouseAdjustmentTableProps {
  adjustments: WarehouseAdjustment[];
  onEdit: (adjustment: WarehouseAdjustment) => void;
  onDelete: (adjustment: WarehouseAdjustment) => void;
  onDetails: (adjustment: WarehouseAdjustment) => void;
  onClose: (adjustment: WarehouseAdjustment) => void;
}

export function WarehouseAdjustmentTable({
  adjustments,
  onEdit,
  onDelete,
  onDetails,
  onClose,
}: WarehouseAdjustmentTableProps) {
  const t = useTranslations('pages.warehouseAdjustments');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('status.closed')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {t('status.open')}
      </span>
    );
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
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.code')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.sourceWarehouse')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.targetWarehouse')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.date')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.description')}
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
          {adjustments.map((adjustment) => (
            <tr key={adjustment.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {adjustment.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium">{adjustment.sourceWarehouse.name}</div>
                  <div className="text-gray-500">{adjustment.sourceWarehouse.code}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium">{adjustment.targetWarehouse.name}</div>
                  <div className="text-gray-500">{adjustment.targetWarehouse.code}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(adjustment.date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-xs truncate" title={adjustment.description}>
                  {adjustment.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    adjustment.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {adjustment.status ? t('status.closed') : t('status.open')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDetails(adjustment)}
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewDetails')}
                  />
                  {!adjustment.status && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onClose(adjustment)}
                      leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                      title={t('actions.close')}
                      style={{ color: '#dc2626' }}
                    />
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(adjustment)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={adjustment.status ? t('actions.cannotEditClosed') : t('actions.edit')}
                    disabled={adjustment.status}
                    className={adjustment.status ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(adjustment)}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={adjustment.status ? t('actions.cannotDeleteClosed') : t('actions.delete')}
                    disabled={adjustment.status}
                    className={adjustment.status ? 'opacity-50 cursor-not-allowed' : ''}
                    style={{ color: adjustment.status ? '#9ca3af' : '#dc2626' }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 