'use client';

import { useTranslations } from 'next-intl';
import { User } from "@/types/user";
import ActionsMenu, { ActionMenuItem } from "@/components/atoms/ActionsMenu";
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter, useParams } from 'next/navigation';
import { EyeIcon, PencilIcon, TrashIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

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
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const locale = params?.locale as string || 'es';
  
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
                  <div className="flex items-center gap-2">
                    {user.name}
                    {user.admin && (
                      <ShieldCheckIcon 
                        className="h-5 w-5" 
                        style={{ color: 'rgb(var(--color-primary-600))' }} 
                        title="Administrador"
                      />
                    )}
                  </div>
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
                  <UserActionsMenu
                    user={user}
                    onViewDetails={onViewDetails}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    tenant={tenant}
                    locale={locale}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface UserActionsMenuProps {
  user: User;
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  tenant: string;
  locale: string;
}

function UserActionsMenu({
  user,
  onViewDetails,
  onEdit,
  onDelete,
  tenant,
  locale,
}: UserActionsMenuProps) {
  const t = useTranslations('pages.users');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const router = useRouter();

  const menuItems: ActionMenuItem[] = [
    ...(can(['user_update'])
      ? [
          {
            icon: <KeyIcon className="h-4 w-4" />,
            label: locale === 'es' ? 'Atribuciones' : locale === 'zh' ? '属性' : 'Attributions',
            color: '#0891b2',
            onClick: () => {
              router.push(`/${tenant}/${locale}/dashboard/configuracion/usuarios/${user.id}/atribuciones`);
            },
          },
          {
            icon: <EyeIcon className="h-4 w-4" />,
            label: t('actions.viewDetails'),
            onClick: () => {
              onViewDetails(user);
            },
          },
          {
            icon: <PencilIcon className="h-4 w-4" />,
            label: tCommon('actions.edit'),
            onClick: () => {
              onEdit(user);
            },
          },
        ]
      : []),
    ...(can(['user_delete'])
      ? [
          {
            icon: <TrashIcon className="h-4 w-4" />,
            label: tCommon('actions.delete'),
            color: '#dc2626',
            onClick: () => {
              onDelete(user);
            },
          },
        ]
      : []),
  ];

  return <ActionsMenu items={menuItems} />;
}