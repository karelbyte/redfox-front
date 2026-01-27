'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CertificationPack, CertificationPackType, CertificationPackFormData } from '@/types/certification-pack';
import { Btn } from '@/components/atoms';

interface CertificationPackFormProps {
  pack?: CertificationPack | null;
  onSubmit: (data: CertificationPackFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function CertificationPackForm({
  pack,
  onSubmit,
  onCancel,
  isSaving = false,
}: CertificationPackFormProps) {
  const t = useTranslations('pages.certificationPacks');
  const [formData, setFormData] = useState<CertificationPackFormData>({
    type: CertificationPackType.FACTURAAPI,
    name: '',
    description: '',
    config: {},
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    if (pack) {
      setFormData({
        type: pack.type,
        name: pack.name,
        description: pack.description || '',
        config: pack.config || {},
        is_active: pack.is_active,
        is_default: pack.is_default,
      });
    }
  }, [pack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.name')} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Btn type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          {t('actions.cancel')}
        </Btn>
        <Btn type="submit" disabled={isSaving}>
          {isSaving ? t('actions.saving') : (pack ? t('actions.update') : t('actions.create'))}
        </Btn>
      </div>
    </form>
  );
}
