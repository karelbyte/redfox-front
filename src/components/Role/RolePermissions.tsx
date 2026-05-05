'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Checkbox } from '@/components/atoms';
import { PermissionGroup } from '@/types/permission';
import { permissionsService } from '@/services/permissions.service';
import { toastService } from '@/services/toast.service';

interface RolePermissionsProps {
  roleId: string;
  onPermissionsChange?: (permissions: string[]) => void;
}

const MODULE_NAMES: Record<string, { es: string; en: string; zh: string }> = {
  users:                    { es: 'Usuarios',                    en: 'Users',                      zh: '用户' },
  roles:                    { es: 'Roles',                       en: 'Roles',                      zh: '角色' },
  permissions:              { es: 'Permisos',                    en: 'Permissions',                zh: '权限' },
  languages:                { es: 'Idiomas',                     en: 'Languages',                  zh: '语言' },
  clients:                  { es: 'Clientes',                    en: 'Clients',                    zh: '客户' },
  providers:                { es: 'Proveedores',                 en: 'Providers',                  zh: '供应商' },
  measurement_units:        { es: 'Unidades de Medida',          en: 'Measurement Units',          zh: '计量单位' },
  brands:                   { es: 'Marcas',                      en: 'Brands',                     zh: '品牌' },
  categories:               { es: 'Categorías',                  en: 'Categories',                 zh: '分类' },
  taxes:                    { es: 'Impuestos',                   en: 'Taxes',                      zh: '税务' },
  currencies:               { es: 'Monedas',                     en: 'Currencies',                 zh: '货币' },
  products:                 { es: 'Productos',                   en: 'Products',                   zh: '产品' },
  inventory:                { es: 'Inventario',                  en: 'Inventory',                  zh: '库存' },
  warehouses:               { es: 'Almacenes',                   en: 'Warehouses',                 zh: '仓库' },
  warehouse_openings:       { es: 'Aperturas de Almacén',        en: 'Warehouse Openings',         zh: '仓库开仓' },
  warehouse_adjustments:    { es: 'Ajustes de Almacén',          en: 'Warehouse Adjustments',      zh: '仓库调拨' },
  receptions:               { es: 'Recepciones',                 en: 'Receptions',                 zh: '收货' },
  reception_details:        { es: 'Detalles de Recepción',       en: 'Reception Details',          zh: '收货明细' },
  withdrawals:              { es: 'Ventas',                      en: 'Sales',                      zh: '销售' },
  withdrawal_details:       { es: 'Detalles de Venta',           en: 'Sale Details',               zh: '销售明细' },
  product_history:          { es: 'Historial de Productos',      en: 'Product History',            zh: '产品历史' },
  returns:                  { es: 'Devoluciones',                en: 'Returns',                    zh: '退货' },
  role_permissions:         { es: 'Permisos de Roles',           en: 'Role Permissions',           zh: '角色权限' },
  purchase_orders:          { es: 'Órdenes de Compra',           en: 'Purchase Orders',            zh: '采购订单' },
  purchase_order_details:   { es: 'Detalles de Orden de Compra', en: 'Purchase Order Details',     zh: '采购订单明细' },
  invoices:                 { es: 'Facturas',                    en: 'Invoices',                   zh: '发票' },
  invoice_details:          { es: 'Detalles de Factura',         en: 'Invoice Details',            zh: '发票明细' },
  backups:                  { es: 'Respaldos',                   en: 'Backups',                    zh: '备份' },
  analytics:                { es: 'Analítica',                   en: 'Analytics',                  zh: '分析' },
  quotations:               { es: 'Cotizaciones',                en: 'Quotations',                 zh: '报价单' },
  notifications:            { es: 'Notificaciones',              en: 'Notifications',              zh: '通知' },
  expenses:                 { es: 'Gastos',                      en: 'Expenses',                   zh: '费用' },
  accounts_receivable:      { es: 'Cuentas por Cobrar',          en: 'Accounts Receivable',        zh: '应收账款' },
  accounts_payable:         { es: 'Cuentas por Pagar',           en: 'Accounts Payable',           zh: '应付账款' },
  cash_flow:                { es: 'Flujo de Caja',               en: 'Cash Flow',                  zh: '现金流' },
  cash_registers:           { es: 'Cajas Registradoras',         en: 'Cash Registers',             zh: '收银机' },
  audit_logs:               { es: 'Logs de Auditoría',           en: 'Audit Logs',                 zh: '审计日志' },
  company_settings:         { es: 'Config. Empresa',             en: 'Company Settings',           zh: '公司设置' },
  bot:                      { es: 'Bot WhatsApp',                en: 'WhatsApp Bot',               zh: 'WhatsApp 机器人' },
  email_config:             { es: 'Config. Correo',              en: 'Email Config',               zh: '邮件配置' },
  payment_gateway:          { es: 'Pasarela de Pago',            en: 'Payment Gateway',            zh: '支付网关' },
  certification_packs:      { es: 'Packs SAT',                   en: 'SAT Packs',                  zh: 'SAT 套餐' },
  shipments:                { es: 'Logística y Envíos',          en: 'Shipments',                  zh: '物流发货' },
  webhooks:                 { es: 'Webhooks',                    en: 'Webhooks',                   zh: 'Webhooks' },
  hr:                       { es: 'Recursos Humanos',            en: 'Human Resources',            zh: '人力资源' },
};

interface RolePermissionsProps {
  roleId: string;
  onPermissionsChange?: (permissions: string[]) => void;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ roleId, onPermissionsChange }) => {
  const t = useTranslations('pages.roles');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const getLocalizedDescription = (description: string): string => {
    if (!description) return '';
    const parts = description.split(' | ');
    if (parts.length === 3) {
      if (locale === 'zh') return parts[2];
      if (locale === 'es') return parts[1];
      return parts[0];
    }
    if (parts.length === 2) return locale === 'es' ? parts[1] : parts[0];
    return description;
  };

  const formatModuleName = (module: string): string => {
    const entry = MODULE_NAMES[module];
    if (entry) return entry[locale as keyof typeof entry] ?? entry.es;
    return module.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  useEffect(() => {
    setPermissionGroups([]);
    setSelectedPermissions([]);
    setActiveModule(null);
    setLoading(true);
    if (roleId) loadPermissions();
  }, [roleId]);

  const loadPermissions = async () => {
    try {
      const [allPermissions, rolePermissions] = await Promise.all([
        permissionsService.getPermissionsGroupedByModule(),
        permissionsService.getRolePermissions(roleId),
      ]);
      const sorted = [...allPermissions].sort((a, b) => {
        const nameA = MODULE_NAMES[a.module]?.[locale as keyof (typeof MODULE_NAMES)[string]] ?? a.module;
        const nameB = MODULE_NAMES[b.module]?.[locale as keyof (typeof MODULE_NAMES)[string]] ?? b.module;
        return nameA.localeCompare(nameB, locale);
      });
      setPermissionGroups(sorted);
      setSelectedPermissions(rolePermissions);
      if (sorted.length > 0) setActiveModule(sorted[0].module);
    } catch (error) {
      console.error('ERROR en loadPermissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const next = checked
      ? [...selectedPermissions, permissionId]
      : selectedPermissions.filter(id => id !== permissionId);
    setSelectedPermissions(next);
    onPermissionsChange?.(next);
  };

  const handleModuleChange = (module: string, checked: boolean) => {
    const moduleIds = permissionGroups.find(g => g.module === module)?.permissions.map(p => p.id) ?? [];
    const next = checked
      ? [...selectedPermissions.filter(id => !moduleIds.includes(id)), ...moduleIds]
      : selectedPermissions.filter(id => !moduleIds.includes(id));
    setSelectedPermissions(next);
    onPermissionsChange?.(next);
  };

  const isModuleSelected = (module: string): boolean => {
    const ids = permissionGroups.find(g => g.module === module)?.permissions.map(p => p.id) ?? [];
    return ids.length > 0 && ids.every(id => selectedPermissions.includes(id));
  };

  const isModulePartiallySelected = (module: string): boolean => {
    const ids = permissionGroups.find(g => g.module === module)?.permissions.map(p => p.id) ?? [];
    const count = ids.filter(id => selectedPermissions.includes(id)).length;
    return count > 0 && count < ids.length;
  };

  const getModuleSelectedCount = (module: string): number => {
    const ids = permissionGroups.find(g => g.module === module)?.permissions.map(p => p.id) ?? [];
    return ids.filter(id => selectedPermissions.includes(id)).length;
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      await permissionsService.updateRolePermissions(roleId, selectedPermissions);
      toastService.success(t('messages.permissionsUpdated'));
    } catch (error) {
      toastService.error(t('messages.errorUpdatingPermissions'));
    } finally {
      setSaving(false);
    }
  };

  const activeGroup = permissionGroups.find(g => g.module === activeModule);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span style={{ color: 'rgb(var(--color-text-500))' }}>{tCommon('actions.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium" style={{ color: 'rgb(var(--color-text-900))' }}>
            {t('permissions.title')}
          </h3>
          <p className="text-sm" style={{ color: 'rgb(var(--color-text-500))' }}>
            {permissionGroups.length} módulos · {permissionGroups.reduce((s, g) => s + g.permissions.length, 0)} permisos
          </p>
        </div>
        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'rgb(var(--color-primary-600))', color: 'white' }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-700))'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = 'rgb(var(--color-primary-600))'; }}
        >
          {saving ? tCommon('actions.saving') : t('permissions.save')}
        </button>
      </div>

      {permissionGroups.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'rgb(var(--color-text-500))' }}>
          {t('permissions.noPermissions')}
        </div>
      ) : (
        <div className="flex gap-0 rounded-lg overflow-hidden border" style={{ borderColor: 'rgb(var(--color-border-200))' }}>
          <div className="w-72 flex-shrink-0 overflow-y-auto" style={{ backgroundColor: 'rgb(var(--color-background-50))', borderRight: '1px solid rgb(var(--color-border-200))', maxHeight: '520px' }}>
            {permissionGroups.map(group => {
              const isActive = activeModule === group.module;
              const count = getModuleSelectedCount(group.module);
              const total = group.permissions.length;
              return (
                <button
                  key={group.module}
                  onClick={() => setActiveModule(group.module)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors text-sm"
                  style={{
                    backgroundColor: isActive ? 'rgb(var(--color-primary-50))' : 'transparent',
                    borderLeft: isActive ? '3px solid rgb(var(--color-primary-600))' : '3px solid transparent',
                    color: isActive ? 'rgb(var(--color-primary-700))' : 'rgb(var(--color-text-700))',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="truncate">{formatModuleName(group.module)}</span>
                  {count > 0 && (
                    <span
                      className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: count === total ? 'rgb(var(--color-primary-100))' : 'rgb(var(--color-secondary-100))',
                        color: count === total ? 'rgb(var(--color-primary-700))' : 'rgb(var(--color-text-500))',
                      }}
                    >
                      {count}/{total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-5 overflow-y-auto" style={{ maxHeight: '520px', backgroundColor: 'white' }}>
            {activeGroup ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      label={formatModuleName(activeGroup.module)}
                      checked={isModuleSelected(activeGroup.module)}
                      indeterminate={isModulePartiallySelected(activeGroup.module)}
                      onChange={e => handleModuleChange(activeGroup.module, e.target.checked)}
                      className="font-semibold text-base"
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'rgb(var(--color-text-400))' }}>
                    {getModuleSelectedCount(activeGroup.module)} / {activeGroup.permissions.length}
                  </span>
                </div>

                <div className="border-t pt-4 space-y-3" style={{ borderColor: 'rgb(var(--color-border-100))' }}>
                  {activeGroup.permissions.map(permission => (
                    <Checkbox
                      key={permission.id}
                      label={getLocalizedDescription(permission.description)}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={e => handlePermissionChange(permission.id, e.target.checked)}
                      className="text-sm"
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'rgb(var(--color-text-400))' }}>
                Selecciona un módulo
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
