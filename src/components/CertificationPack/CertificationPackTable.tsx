'use client'

import { CertificationPack } from '@/types/certification-pack';
import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface CertificationPackTableProps {
  packs: CertificationPack[];
  onEdit: (pack: CertificationPack) => void;
  onDelete: (pack: CertificationPack) => void;
  onSetDefault: (pack: CertificationPack) => void;
}

export default function CertificationPackTable({
  packs,
  onEdit,
  onDelete,
  onSetDefault,
}: CertificationPackTableProps) {
  const t = useTranslations('pages.certificationPacks');
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
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.type')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('table.status')}
            </th>
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
          {packs.map((pack) => (
            <tr key={pack.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {pack.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pack.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {pack.is_active ? tCommon('status.active') : tCommon('status.inactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {pack.is_default ? (
                  <StarIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {!pack.is_default && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(pack)}
                      leftIcon={<StarIcon className="h-4 w-4" />}
                      title={t('actions.setDefault')}
                    />
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(pack)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={tCommon('actions.edit')}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(pack)}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={tCommon('actions.delete')}
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
