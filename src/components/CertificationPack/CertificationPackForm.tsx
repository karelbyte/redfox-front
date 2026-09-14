'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CertificationPack, CertificationPackType, CertificationPackFormData } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';
import { resetPackCapabilities } from '@/hooks/usePackCapabilities';
import { useAvailablePackTypes } from '@/hooks/useAvailablePackTypes';

export interface CertificationPackFormRef {
  submit: () => void;
}

interface CertificationPackFormProps {
  pack?: CertificationPack | null;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

function CertificationPackFormInner(
  {
    pack,
    onSuccess,
    onSavingChange,
    onValidChange,
  }: CertificationPackFormProps,
  ref: React.ForwardedRef<CertificationPackFormRef>,
) {
  const t = useTranslations('pages.certificationPacks');
  // Los packs disponibles dependen del país de la organización: la lista la
  // resuelve el backend.
  const { types: allowedPackTypes, country, loading: loadingTypes } =
    useAvailablePackTypes();
  const defaultPackType = allowedPackTypes[0] ?? CertificationPackType.FACTURAAPI;
  const [formData, setFormData] = useState<CertificationPackFormData>({
    type: defaultPackType,
    config: {},
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    if (pack) {
      setFormData({
        type: pack.type,
        config: pack.config || {},
        is_active: pack.is_active,
        is_default: pack.is_default,
      });
    } else {
      setFormData({
        type: defaultPackType,
        config: {},
        is_active: true,
        is_default: false,
      });
    }
  }, [defaultPackType, pack]);

  useEffect(() => {
    if (pack) {
      return;
    }

    if (loadingTypes || allowedPackTypes.length === 0) {
      return;
    }

    if (!allowedPackTypes.includes(formData.type)) {
      setFormData(prev => ({
        ...prev,
        type: defaultPackType,
      }));
    }
  }, [allowedPackTypes, defaultPackType, formData.type, loadingTypes, pack]);

  const validateForm = useMemo(() => {
    const cfg = formData.config || {};

    if (formData.type === CertificationPackType.FACTURAAPI) {
      return !!String(cfg.api_key || '').trim();
    }

    if (formData.type === CertificationPackType.FACTURA_GREEN) {
      return (
        !!String(cfg.tenant_id || '').trim() &&
        !!String(cfg.business_uuid || '').trim() &&
        !!String(cfg.api_key || '').trim()
      );
    }

    if (formData.type === CertificationPackType.FACTURA_SUNAT) {
      const series = (cfg.series || {}) as Record<string, string>;

      return (
        !!String(cfg.sunat_api_key || '').trim() &&
        /^\d{11}$/.test(String(cfg.ruc || '').trim()) &&
        // Al menos una serie: sin ella no se puede numerar ningún comprobante.
        (!!String(series.factura || '').trim() ||
          !!String(series.boleta || '').trim())
      );
    }

    return true;
  }, [formData.config, formData.type]);

  useEffect(() => {
    onValidChange?.(validateForm);
  }, [onValidChange, validateForm]);

  const handleSubmit = async () => {
    if (!validateForm) return;

    try {
      onSavingChange(true);

      const payload: CertificationPackFormData = {
        type: formData.type,
        config: formData.config || {},
        is_active: !!formData.is_active,
        is_default: !!formData.is_default,
      };

      if (pack) {
        await certificationPackService.update(pack.id, payload);
        toastService.success(t('messages.successUpdated'));
      } else {
        await certificationPackService.create(payload);
        toastService.success(t('messages.successCreated'));
      }

      // Cambiar el pack cambia lo que la UI debe ofrecer
      resetPackCapabilities();
      onSuccess();
    } catch (error) {
      console.error('Error saving pack:', error);
      toastService.error(t('messages.errorSaving'));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  // La configuración de SUNAT anida series y valores por defecto
  const updateNestedConfig = (parent: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [parent]: {
          ...(prev.config?.[parent] || {}),
          [key]: value,
        },
      },
    }));
  };

  const renderConfigFields = () => {
    if (formData.type === CertificationPackType.FACTURAAPI) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.config?.api_key || ''}
              onChange={(e) => updateConfig('api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk_live_..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Obtén tu API Key desde tu cuenta de FacturaAPI
            </p>
          </div>
        </div>
      );
    }

    if (formData.type === CertificationPackType.FACTURA_GREEN) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.config?.api_key || ''}
              onChange={(e) => updateConfig('api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="BDI5e07d9c59c5a5297058e32d6b9883dce92b175104"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tu API Key de Factura Green (x-application-key)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant ID *
            </label>
            <input
              type="text"
              value={formData.config?.tenant_id || ''}
              onChange={(e) => updateConfig('tenant_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.alpha.tpa.factura.green"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL base de tu tenant (ej: https://api.alpha.tpa.factura.green)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business UUID *
            </label>
            <input
              type="text"
              value={formData.config?.business_uuid || ''}
              onChange={(e) => updateConfig('business_uuid', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e-business-160625973100059788268-4a7c-44f8-a3b1-8346a22b9061"
            />
            <p className="mt-1 text-xs text-gray-500">
              UUID del business (emisor) registrado en Factura Green
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account UUID
            </label>
            <input
              type="text"
              value={formData.config?.account_uuid || '0000'}
              onChange={(e) => updateConfig('account_uuid', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0000"
            />
            <p className="mt-1 text-xs text-gray-500">
              UUID de la cuenta (por defecto: 0000)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              ℹ️ Información Importante
            </h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Debes tener un business registrado en Factura Green</li>
              <li>El CSD debe estar cargado en tu business</li>
              <li>Los clientes y productos se sincronizarán automáticamente</li>
            </ul>
          </div>
        </div>
      );
    }

    if (formData.type === CertificationPackType.FACTURA_SUNAT) {
      const series = (formData.config?.series || {}) as Record<string, string>;
      const defaults = (formData.config?.defaults || {}) as Record<string, unknown>;

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.config?.sunat_api_key || ''}
              onChange={(e) => updateConfig('sunat_api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Token del proveedor de facturación"
            />
            <p className="mt-1 text-xs text-gray-500">
              Token de acceso que te entrega tu proveedor de comprobantes electrónicos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUC del emisor *
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={formData.config?.ruc || ''}
              onChange={(e) => updateConfig('ruc', e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20123456789"
            />
            <p className="mt-1 text-xs text-gray-500">
              11 dígitos. Es el RUC con el que se emiten los comprobantes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serie de facturas
              </label>
              <input
                type="text"
                maxLength={4}
                value={series.factura || ''}
                onChange={(e) => updateNestedConfig('series', 'factura', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="F001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serie de boletas
              </label>
              <input
                type="text"
                maxLength={4}
                value={series.boleta || ''}
                onChange={(e) => updateNestedConfig('series', 'boleta', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="B001"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Al menos una serie es obligatoria. Se crean automáticamente al guardar y su
            correlativo se gestiona desde Series de comprobantes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <input
                type="text"
                maxLength={3}
                value={(defaults.moneda as string) || ''}
                onChange={(e) => updateNestedConfig('defaults', 'moneda', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PEN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IGV (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={(defaults.igv as number) ?? ''}
                onChange={(e) => updateNestedConfig('defaults', 'igv', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="18"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de operación
              </label>
              <input
                type="text"
                maxLength={4}
                value={(defaults.tipo_operacion as string) || ''}
                onChange={(e) => updateNestedConfig('defaults', 'tipo_operacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0101"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Opcionales. Si los dejas vacíos se usan PEN, 18% y 0101 (venta interna).
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              ℹ️ Información Importante
            </h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>El comprobante se elige por el documento del cliente: con RUC, factura; con DNI o sin documento, boleta</li>
              <li>Los clientes y productos no se sincronizan: sus datos viajan dentro del comprobante</li>
              <li>Cada venta del punto de venta emite su comprobante en el acto</li>
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.type')} *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CertificationPackType }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!!pack || loadingTypes}
        >
          {allowedPackTypes.includes(CertificationPackType.FACTURAAPI) && (
            <option value={CertificationPackType.FACTURAAPI}>FacturaAPI</option>
          )}
          {allowedPackTypes.includes(CertificationPackType.FACTURA_GREEN) && (
            <option value={CertificationPackType.FACTURA_GREEN}>Factura Green</option>
          )}
          {allowedPackTypes.includes(CertificationPackType.FACTURA_SUNAT) && (
            <option value={CertificationPackType.FACTURA_SUNAT}>SUNAT (Perú)</option>
          )}
        </select>
        {country && (
          <p className="mt-1 text-xs text-gray-500">
            {t('form.availableForCountry', { country: country.name })}
          </p>
        )}
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{t('form.configuration')}</h3>
        {renderConfigFields()}
      </div>

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{t('form.isActive')}</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{t('form.isDefault')}</span>
        </label>
      </div>
    </form>
  );
}

const CertificationPackForm = forwardRef<CertificationPackFormRef, CertificationPackFormProps>(
  CertificationPackFormInner,
);

CertificationPackForm.displayName = 'CertificationPackForm';

export default CertificationPackForm;
