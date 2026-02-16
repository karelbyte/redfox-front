import { useTranslations } from 'next-intl';
import { Reception } from '@/types/reception';
import { PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";

interface ReceptionTableProps {
  receptions: Reception[];
  onEdit: (reception: Reception) => void;
  onDelete: (reception: Reception) => void;
  onDetails: (reception: Reception) => void;
  onClose: (reception: Reception) => void;
  onGeneratePDF: (reception: Reception) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (checked: boolean) => void;
}

export default function ReceptionTable({ 
  receptions, 
  onEdit, 
  onDelete, 
  onDetails, 
  onClose, 
  onGeneratePDF,
  visibleColumns = [],
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: ReceptionTableProps) {
  const t = useTranslations('pages.receptions');
  
  if (!Array.isArray(receptions)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isColumnVisible = (column: string) => {
    return visibleColumns.length === 0 || visibleColumns.includes(column);
  };

  const allSelected = receptions.length > 0 && receptions.every(r => selectedIds.includes(r.id));
  const someSelected = receptions.some(r => selectedIds.includes(r.id)) && !allSelected;

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
            {onSelectChange && onSelectAllChange && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={(e) => onSelectAllChange(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {isColumnVisible('code') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {isColumnVisible('date') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.date')}
              </th>
            )}
            {isColumnVisible('provider') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.provider')}
              </th>
            )}
            {isColumnVisible('warehouse') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.warehouse')}
              </th>
            )}
            {isColumnVisible('document') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.document')}
              </th>
            )}
            {isColumnVisible('amount') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.amount')}
              </th>
            )}
            {isColumnVisible('status') && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.status')}
              </th>
            )}
            {isColumnVisible('actions') && (
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
          {receptions.map((reception) => (
            <tr key={reception.id} className="hover:bg-primary-50 transition-colors">
              {onSelectChange && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(reception.id)}
                    onChange={() => onSelectChange(reception.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
              )}
              {isColumnVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reception.code}</td>
              )}
              {isColumnVisible('date') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(reception.date)}
                </td>
              )}
              {isColumnVisible('provider') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reception.provider.name}
                </td>
              )}
              {isColumnVisible('warehouse') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reception.warehouse.name}
                </td>
              )}
              {isColumnVisible('document') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reception.document}
                </td>
              )}
              {isColumnVisible('amount') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(reception.amount)}
                </td>
              )}
              {isColumnVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reception.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {reception.status ? t('status.open') : t('status.closed')}
                  </span>
                </td>
              )}
              {isColumnVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDetails(reception)}
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onGeneratePDF(reception)}
                      leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                      title={t('actions.generatePDF')}
                    />
                    {reception.status && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onClose(reception)}
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        title={t('actions.closeReception')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(reception)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={reception.status ? t('actions.edit') : t('actions.cannotEditClosed')}
                      disabled={!reception.status}
                      className={!reception.status ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reception)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={reception.status ? t('actions.delete') : t('actions.cannotDeleteClosed')}
                      disabled={!reception.status}
                      className={!reception.status ? 'opacity-50 cursor-not-allowed' : ''}
                      style={{ color: reception.status ? '#dc2626' : '#9ca3af' }}
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