'use client';

import { useTranslations } from 'next-intl';
import { User } from "@/types/user";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";

interface UserTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  visibleColumns?: string[];
}

export default function UserTable({
  users,
  onViewDetails,
  onEdit,
  onDelete,
  visibleColumns = ['name', 'email', 'roles', 'status', 'createdAt', 'actions']
}: UserTableProps) {
  const t = useTranslations('pages.users');
  
  if (!Array.isArray(users)) {
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

  const formatRoles = (roles: User['roles']) => {
    if (roles.length === 0) return '-';
    if (roles.length === 1) return roles[0].description;
    return `${roles[0].description} +${roles.length - 1}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {visibleColumns.includes('name') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.name')}
              </th>
            )}
            {visibleColumns.includes('email') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.email')}
              </th>
            )}
            {visibleColumns.includes('roles') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.roles')}
              </th>
            )}
            {visibleColumns.includes('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.status')}
              </th>
            )}
            {visibleColumns.includes('createdAt') && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.createdAt')}
              </th>
            )}
            {visibleColumns.includes('actions') && (
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              {visibleColumns.includes('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
              )}
              {visibleColumns.includes('email') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
              )}
              {visibleColumns.includes('roles') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatRoles(user.roles)}
                </td>
              )}
              {visibleColumns.includes('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status ? t('table.statusActive') : t('table.statusInactive')}
                  </span>
                </td>
              )}
              {visibleColumns.includes('createdAt') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(user.created_at)}
                </td>
              )}
              {visibleColumns.includes('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Btn
                      onClick={() => onEdit(user)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={t('actions.edit')}
                    />
                    <Btn
                      onClick={() => onViewDetails(user)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />
                    <Btn
                      onClick={() => onDelete(user)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={t('actions.delete')}
                      style={{ color: '#dc2626' }}
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