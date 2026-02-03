'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CertificationPack, CertificationPackType, CertificationPackFormData } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';

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
  const [formData, setFormData] = useState<CertificationPackFormData>({
    type: CertificationPackType.FACTURAAPI,
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
        type: CertificationPackType.FACTURAAPI,
        config: {},
        is_active: true,
        is_default: false,
      });
    }
  }, [pack]);

  const validateForm = useMemo(() => {
    const cfg = formData.config || {};

    if (formData.type === CertificationPackType.FACTURAAPI) {
      return !!String(cfg.api_key || '').trim();
    }

    if (formData.type === CertificationPackType.SAT) {
      return (
        !!String(cfg.certificate || '').trim() &&
        !!String(cfg.key || '').trim() &&
        !!String(cfg.password || '').trim()
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

  const renderConfigFields = () => {
    if (formData.type === CertificationPackType.FACTURAAPI) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formData.config?.api_key || ''}
              onChange={(e) => updateConfig('api_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk_live_..."
            />
          </div>
        </div>
      );
    }

    if (formData.type === CertificationPackType.SAT) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificado (Base64)
            </label>
            <textarea
              value={formData.config?.certificate || ''}
              onChange={(e) => updateConfig('certificate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="-----BEGIN CERTIFICATE-----..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key (Base64)
            </label>
            <textarea
              value={formData.config?.key || ''}
              onChange={(e) => updateConfig('key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="-----BEGIN PRIVATE KEY-----..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña del Certificado
            </label>
            <input
              type="password"
              value={formData.config?.password || ''}
              onChange={(e) => updateConfig('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña del certificado"
            />
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
          disabled={!!pack}
        >
          <option value={CertificationPackType.FACTURAAPI}>FacturaAPI</option>
          <option value={CertificationPackType.SAT}>SAT</option>
        </select>
      </div>

      <div className="border-t pt-4">
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
