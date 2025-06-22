import { useTranslations } from 'next-intl';
import { Reception } from '@/types/reception';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";

interface ReceptionTableProps {
  receptions: Reception[];
  onEdit: (reception: Reception) => void;
  onDelete: (reception: Reception) => void;
  onDetails: (reception: Reception) => void;
  onClose: (reception: Reception) => void;
}

export default function ReceptionTable({ receptions, onEdit, onDelete, onDetails, onClose }: ReceptionTableProps) {
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
              {t('table.date')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.provider')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.warehouse')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.document')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.amount')}
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
          {receptions.map((reception) => (
            <tr key={reception.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reception.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(reception.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {reception.provider.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {reception.warehouse.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {reception.document}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(reception.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    reception.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {reception.status ? t('status.open') : t('status.closed')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDetails(reception)}
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewDetails')}
                  />
                  {reception.status && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onClose(reception)}
                      leftIcon={<XMarkIcon className="h-4 w-4" />}
                      title={t('actions.closeReception')}
                      style={{ color: '#dc2626' }}
                    />
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(reception)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={t('actions.edit')}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reception)}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={t('actions.delete')}
                    style={{ color: '#dc2626' }}
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