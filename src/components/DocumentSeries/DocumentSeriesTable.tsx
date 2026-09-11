'use client'

import { StarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Btn } from '@/components/atoms';
import { DocumentSeries } from '@/types/document-series';

interface DocumentSeriesTableProps {
  series: DocumentSeries[];
  onSetDefault: (item: DocumentSeries) => void;
  onToggleActive: (item: DocumentSeries) => void;
}

export default function DocumentSeriesTable({
  series,
  onSetDefault,
  onToggleActive,
}: DocumentSeriesTableProps) {
  const t = useTranslations('pages.documentSeries');
  const tCommon = useTranslations('common');

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`,
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['series', 'documentType', 'currentNumber', 'status'].map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t(`table.${key}`)}
              </th>
            ))}
            <th
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.default')}
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
          {series.map((item) => (
            <tr key={item.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.series}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {t(`documentTypes.${item.document_type}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {/* El correlativo solo lo mueve la emisión: aquí es informativo */}
                {item.series}-{String(item.current_number).padStart(8, '0')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.is_active ? tCommon('status.active') : tCommon('status.inactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {item.is_default ? (
                  <StarIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {!item.is_default && item.is_active && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(item)}
                      leftIcon={<StarIcon className="h-4 w-4" />}
                      title={t('actions.setDefault')}
                    />
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(item)}
                    leftIcon={
                      item.is_active ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )
                    }
                    title={item.is_active ? t('actions.deactivate') : t('actions.activate')}
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
