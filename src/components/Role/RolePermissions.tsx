'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Checkbox } from '@/components/atoms';
import { PermissionGroup } from '@/types/permission';
import { permissionsService } from '@/services/permissions.service';
import { toastService } from '@/services/toast.service';

interface RolePermissionsProps {
  roleId: string;
  onPermissionsChange?: (permissions: string[]) => void;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ 
  roleId, 
  onPermissionsChange 
}) => {
  const t = useTranslations('pages.roles');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Función para obtener la descripción en el idioma correcto
  const getLocalizedDescription = (description: string): string => {
    if (!description) return '';
    
    const parts = description.split(' | ');
    if (parts.length === 2) {
      // Si hay dos partes, la primera es inglés y la segunda español
      return locale === 'es' ? parts[1] : parts[0];
    }
    
    // Si no hay separador, devolver la descripción completa
    return description;
  };

  // Función para formatear el nombre del módulo
  const formatModuleName = (module: string): string => {
    return module
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Limpiar estado cuando cambie el roleId
    setPermissionGroups([]);
    setSelectedPermissions([]);
    setLoading(true);
    
    if (roleId) {
      loadPermissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const loadPermissions = async () => {
    if (!roleId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setSelectedPermissions([]);
      
      const allPermissions = await permissionsService.getPermissionsGroupedByModule();
      setPermissionGroups(allPermissions);
      
      const rolePermissions = await permissionsService.getRolePermissions(roleId);
      setSelectedPermissions(rolePermissions);
      
      setLoading(false);
      
    } catch (error) {
      console.error('ERROR en loadPermissions:', error);
      setLoading(false);
      setPermissionGroups([]);
      setSelectedPermissions([]);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentSelected = selectedPermissions || [];
    const newSelectedPermissions = checked
      ? [...currentSelected, permissionId]
      : currentSelected.filter(id => id !== permissionId);
    
    setSelectedPermissions(newSelectedPermissions);
    onPermissionsChange?.(newSelectedPermissions);
  };

  const handleModuleChange = (module: string, checked: boolean) => {
    const currentSelected = selectedPermissions || [];
    const modulePermissions = permissionGroups
      .find(group => group.module === module)
      ?.permissions.map(p => p.id) || [];
    
    const newSelectedPermissions = checked
      ? [...currentSelected.filter(id => !modulePermissions.includes(id)), ...modulePermissions]
      : currentSelected.filter(id => !modulePermissions.includes(id));
    
    setSelectedPermissions(newSelectedPermissions);
    onPermissionsChange?.(newSelectedPermissions);
  };

  const isModuleSelected = (module: string): boolean => {
    const currentSelected = selectedPermissions || [];
    const modulePermissions = permissionGroups
      .find(group => group.module === module)
      ?.permissions.map(p => p.id) || [];
    
    return modulePermissions.length > 0 && modulePermissions.every(id => currentSelected.includes(id));
  };

  const isModulePartiallySelected = (module: string): boolean => {
    const currentSelected = selectedPermissions || [];
    const modulePermissions = permissionGroups
      .find(group => group.module === module)
      ?.permissions.map(p => p.id) || [];
    
    const selectedCount = modulePermissions.filter(id => currentSelected.includes(id)).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const currentSelected = selectedPermissions || [];
      await permissionsService.updateRolePermissions(roleId, currentSelected);
      toastService.success(t('messages.permissionsUpdated'));
    } catch (error) {
      console.error('Error saving permissions:', error);
      toastService.error(t('messages.errorUpdatingPermissions'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-2" style={{ color: 'rgb(var(--color-text-500))' }}>{tCommon('actions.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium" style={{ color: 'rgb(var(--color-text-900))' }}>{t('permissions.title')}</h3>
          <p className="text-sm" style={{ color: 'rgb(var(--color-text-500))' }}>
            {permissionGroups.length} módulos, {permissionGroups.reduce((total, group) => total + group.permissions.length, 0)} permisos totales
          </p>
        </div>
        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
          style={{ 
            backgroundColor: 'rgb(var(--color-primary-600))',
            color: 'rgb(var(--color-primary-50))'
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-700))';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-600))';
            }
          }}
        >
          {saving ? tCommon('actions.saving') : t('permissions.save')}
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {permissionGroups.map((group) => (
            <div key={group.module} className="rounded-lg p-4" style={{ 
              border: '1px solid rgb(var(--color-border-200))',
              backgroundColor: 'rgb(var(--color-background-50))'
            }}>
              <div className="mb-3">
                <Checkbox
                  label={formatModuleName(group.module)}
                  checked={isModuleSelected(group.module)}
                  indeterminate={isModulePartiallySelected(group.module)}
                  onChange={(e) => handleModuleChange(group.module, e.target.checked)}
                  className="font-medium"
                />
              </div>
              
              <div className="ml-6 space-y-2">
                {group.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox
                      label={getLocalizedDescription(permission.description)}
                      checked={(selectedPermissions || []).includes(permission.id)}
                      onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {permissionGroups.length === 0 && (
        <div className="text-center py-8" style={{ color: 'rgb(var(--color-text-500))' }}>
          {t('permissions.noPermissions')}
        </div>
      )}
    </div>
  );
};

export default RolePermissions; 