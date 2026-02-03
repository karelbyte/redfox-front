'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';
import { UserWithPermissionDescriptions } from '@/types/user';
import { usersService } from '@/services/users.service';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';

export default function UserDetailsPage() {
  const t = useTranslations('pages.users');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  
  const [user, setUser] = useState<UserWithPermissionDescriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersService.getUserWithPermissionDescriptions(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(t('messages.errorLoading'));
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRoles = (roles: UserWithPermissionDescriptions['roles']) => {
    if (roles.length === 0) return '-';
    return roles.map(role => `${role.code} - ${role.description}`).join(', ');
  };

  const getLocalizedPermission = (permission: string): string => {
    if (permission.includes('|')) {
      const [english, spanish] = permission.split('|').map(p => p.trim());
      return locale === 'es' ? spanish : english;
    }
    return permission;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 
            className="text-xl font-semibold mb-4"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t('error.title')}
          </h1>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-600))` }}
          >
            {error || t('error.userNotFound')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/configuracion/usuarios`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: `rgb(var(--color-primary-800))` }}
            >
              {t('details.title', { name: user.name })}
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('details.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Información General */}
        <div 
          className="rounded-lg shadow p-6"
          style={{ backgroundColor: `rgb(var(--color-surface))` }}
        >
          <h2 
            className="text-lg font-medium mb-4"
            style={{ color: `rgb(var(--color-primary-700))` }}
          >
            {t('details.generalInfo')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {t('form.name')}
              </label>
              <p 
                className="text-sm"
                style={{ color: `rgb(var(--color-text-primary))` }}
              >
                {user.name}
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {t('form.email')}
              </label>
              <p 
                className="text-sm"
                style={{ color: `rgb(var(--color-text-primary))` }}
              >
                {user.email}
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {t('form.roles')}
              </label>
              <p 
                className="text-sm"
                style={{ color: `rgb(var(--color-text-primary))` }}
              >
                {formatRoles(user.roles)}
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {t('form.status')}
              </label>
              <span 
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.status ? tCommon('status.active') : tCommon('status.inactive')}
              </span>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {t('table.createdAt')}
              </label>
              <p 
                className="text-sm"
                style={{ color: `rgb(var(--color-text-primary))` }}
              >
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Permisos */}
        <div 
          className="rounded-lg shadow p-6"
          style={{ backgroundColor: `rgb(var(--color-surface))` }}
        >
          <h2 
            className="text-lg font-medium mb-4"
            style={{ color: `rgb(var(--color-primary-700))` }}
          >
            {t('permissions.title')}
          </h2>
          
          {user.permission_descriptions.length === 0 ? (
            <p 
              className="text-sm"
              style={{ color: `rgb(var(--color-text-secondary))` }}
            >
              {t('permissions.noPermissions')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {user.permission_descriptions.map((permission, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `rgb(var(--color-primary-500))` }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: `rgb(var(--color-text-primary))` }}
                  >
                    {getLocalizedPermission(permission)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 