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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.name')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.type')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.default')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {packs.map((pack) => (
            <tr key={pack.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                {pack.description && (
                  <div className="text-sm text-gray-500">{pack.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {pack.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {pack.is_active ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {t('table.active')}
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {t('table.inactive')}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {pack.is_default ? (
                  <StarIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {!pack.is_default && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(pack)}
                      title={t('actions.setDefault')}
                    >
                      <StarIcon className="h-4 w-4" />
                    </Btn>
                  )}
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(pack)}
                    title={t('actions.edit')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(pack)}
                    title={t('actions.delete')}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Btn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
