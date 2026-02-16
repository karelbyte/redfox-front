"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { emailConfigService, EmailConfig } from '@/services/email-config.service';
import { toastService } from '@/services/toast.service';
import { Input, Btn, EmptyState } from '@/components/atoms';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import Loading from '@/components/Loading/Loading';

export default function EmailConfigForm() {
  const t = useTranslations('emailConfig');
  const tCommon = useTranslations('common.actions');
  const tCommonMsg = useTranslations('common');
  const { can } = usePermissions();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
    secure: false,
  });

  // Check permissions
  if (!can(['email_config_module_view'])) {
    return (
      <EmptyState
        title={tCommonMsg('noPermission')}
        description={tCommonMsg('noPermissionDescription')}
      />
    );
  }

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const config = await emailConfigService.getConfig();
      setFormData({
        host: config.host,
        port: config.port,
        user: config.user,
        password: '', // Don't load password for security
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        secure: config.secure,
      });
      setHasExistingConfig(true);
    } catch (error) {
      setHasExistingConfig(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'port' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.host || !formData.port || !formData.user || !formData.password || !formData.fromEmail) {
      toastService.error(t('form.errors.requiredFields'));
      return;
    }

    try {
      setIsSaving(true);
      if (hasExistingConfig) {
        await emailConfigService.updateConfig(formData);
        toastService.success(t('messages.updateSuccess'));
      } else {
        await emailConfigService.createConfig(formData);
        toastService.success(t('messages.createSuccess'));
        setHasExistingConfig(true);
      }
      setTestResult(null);
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.host || !formData.port || !formData.user || !formData.password || !formData.fromEmail) {
      toastService.error(t('form.errors.requiredFields'));
      return;
    }

    try {
      setIsTesting(true);
      const result = await emailConfigService.testConnection();
      setTestResult(result);
      if (result.success) {
        toastService.success(result.message);
      } else {
        toastService.error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('messages.testError');
      setTestResult({ success: false, message: errorMessage });
      toastService.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.host')}
              name="host"
              value={formData.host}
              onChange={handleChange}
              placeholder={t('form.placeholders.host')}
              required
            />
            <Input
              label={t('form.port')}
              name="port"
              type="number"
              value={formData.port}
              onChange={handleChange}
              placeholder="587"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.user')}
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder={t('form.placeholders.user')}
              required
            />
            <Input
              label={t('form.password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('form.placeholders.password')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.fromEmail')}
              name="fromEmail"
              type="email"
              value={formData.fromEmail}
              onChange={handleChange}
              placeholder={t('form.placeholders.fromEmail')}
              required
            />
            <Input
              label={t('form.fromName')}
              name="fromName"
              value={formData.fromName}
              onChange={handleChange}
              placeholder={t('form.placeholders.fromName')}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="secure"
              name="secure"
              checked={formData.secure}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="secure" className="text-sm text-gray-700">
              {t('form.secure')}
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Btn
            onClick={handleSave}
            disabled={isSaving || isTesting}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isSaving ? tCommon('saving') : tCommon('save')}
          </Btn>
          <Btn
            onClick={handleTest}
            disabled={isSaving || isTesting}
            variant="secondary"
          >
            {isTesting ? t('form.testing') : t('form.test')}
          </Btn>
        </div>

        {testResult && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            testResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.success ? t('form.testSuccess') : t('form.testFailed')}
              </p>
              <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">{t('info.title')}</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>{t('info.item1')}</li>
          <li>{t('info.item2')}</li>
          <li>{t('info.item3')}</li>
          <li>{t('info.item4')}</li>
        </ul>
      </div>
    </div>
  );
}
