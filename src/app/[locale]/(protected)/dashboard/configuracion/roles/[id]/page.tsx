'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Role } from '@/types/role';
import { rolesService } from '@/services/roles.service';
import { toastService } from '@/services/toast.service';
import RolePermissions from '@/components/Role/RolePermissions';

const RoleDetailsPage: React.FC = () => {
  const t = useTranslations('pages.roles');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  const locale = params.locale as string;

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleId) {
      loadRole();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const roleData = await rolesService.getRole(roleId);
      setRole(roleData);
    } catch (error) {
      console.error('Error loading role:', error);
      toastService.error(t('messages.errorLoading'));
      router.push(`/${locale}/dashboard/configuracion/roles`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsChange = (permissions: string[]) => {
    console.log('Permissions changed:', permissions);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-background-50))' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-8">
            <div style={{ color: 'rgb(var(--color-text-500))' }}>{tCommon('actions.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-background-50))' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div style={{ color: 'rgb(var(--color-text-500))' }}>{t('messages.roleNotFound')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-background-50))' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center mb-4 hover:opacity-80 transition-opacity"
            style={{ color: 'rgb(var(--color-primary-600))' }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tCommon('actions.back')}
          </button>
          
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-900))' }}>
            {t('details.title', { name: role.description })}
          </h1>
          <p className="mt-2" style={{ color: 'rgb(var(--color-text-600))' }}>
            {t('details.subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Información del rol - Ancho completo */}
          <div>
            <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'rgb(var(--color-background-0))' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-900))' }}>
                {t('details.generalInfo')}
              </h2>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'rgb(var(--color-text-700))' }}>
                    {t('form.code')}
                  </label>
                  <p className="mt-1 text-sm" style={{ color: 'rgb(var(--color-text-900))' }}>{role.code}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'rgb(var(--color-text-700))' }}>
                    {t('form.description')}
                  </label>
                  <p className="mt-1 text-sm" style={{ color: 'rgb(var(--color-text-900))' }}>{role.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'rgb(var(--color-text-700))' }}>
                    {t('form.status')}
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    role.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {role.status ? t('table.statusActive') : t('table.statusInactive')}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'rgb(var(--color-text-700))' }}>
                    {t('table.createdAt')}
                  </label>
                  <p className="mt-1 text-sm" style={{ color: 'rgb(var(--color-text-900))' }}>
                    {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permisos - Ancho completo */}
          <div>
            <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'rgb(var(--color-background-0))' }}>
              <RolePermissions 
                roleId={roleId} 
                onPermissionsChange={handlePermissionsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsPage; 