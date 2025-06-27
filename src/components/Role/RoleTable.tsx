'use client';

import { useTranslations } from 'next-intl';
import { Role } from "@/types/role";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";

interface RoleTableProps {
  roles: Role[];
  onViewDetails: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export default function RoleTable({
  roles,
  onViewDetails,
  onEdit,
  onDelete,
}: RoleTableProps) {
  const t = useTranslations('pages.roles');
  
  if (!Array.isArray(roles)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.code')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.description')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.createdAt')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {role.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {role.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  role.status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {role.status ? t('table.statusActive') : t('table.statusInactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(role.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    onClick={() => onEdit(role)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={t('actions.edit')}
                  />
                  <Btn
                    onClick={() => onViewDetails(role)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewDetails')}
                  />
                  <Btn
                    onClick={() => onDelete(role)}
                    variant="ghost"
                    size="sm"
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