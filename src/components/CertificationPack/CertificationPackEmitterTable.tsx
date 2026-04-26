'use client';

import { CertificationPackEmitter } from '@/types/certification-pack';
import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Btn } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface CertificationPackEmitterTableProps {
  emitters: CertificationPackEmitter[];
  onEdit: (emitter: CertificationPackEmitter) => void;
  onDelete: (emitterId: string) => void;
}

export default function CertificationPackEmitterTable({
  emitters,
  onEdit,
  onDelete,
}: CertificationPackEmitterTableProps) {
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
              style={{ color: 'rgb(var(--color-primary-600))' }}
            >
              Identificador
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgb(var(--color-primary-600))' }}
            >
              Nombre
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgb(var(--color-primary-600))' }}
            >
              Estado
            </th>
            <th
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgb(var(--color-primary-600))' }}
            >
              Favorito
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgb(var(--color-primary-600))' }}
            >
              {tCommon('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emitters.map((emitter) => (
            <tr key={emitter.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {emitter.emitter}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {emitter.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    emitter.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {emitter.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {emitter.fav ? (
                  <StarIconSolid className="h-5 w-5 text-yellow-400 mx-auto" />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(emitter)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={tCommon('actions.edit')}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(emitter.id!)}
                    leftIcon={<TrashIcon className="h-4 w-4 text-red-500" />}
                    title={tCommon('actions.delete')}
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
