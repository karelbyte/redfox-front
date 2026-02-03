'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Btn, Input } from '@/components/atoms';
import { CompanySettings } from '@/types/company-settings';
import { companySettingsService } from '@/services/company-settings.service';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';

// Misma base que la API (sin /api) para que las imágenes en /uploads se carguen desde el servidor correcto
const getApiOrigin = (): string =>
  process.env.NEXT_PUBLIC_URL_API || 'https://nitro-api-app-production.up.railway.app';

const getLogoFullUrl = (logoUrl: string | null): string | null => {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http')) return logoUrl;
  const base = getApiOrigin().replace(/\/$/, '');
  const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
  return `${base}${path}`;
};

export default function GeneralesEmpresaPage() {
  const t = useTranslations('pages.companySettings');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    legalName: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await companySettingsService.get();
      setSettings(data);
      setForm({
        name: data.name ?? '',
        legalName: data.legalName ?? '',
        taxId: data.taxId ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        website: data.website ?? '',
      });
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await companySettingsService.update({
        name: form.name || undefined,
        legalName: form.legalName || undefined,
        taxId: form.taxId || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
      });
      setSettings(updated);
      toastService.success(t('messages.saved'));
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastService.error(t('messages.invalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastService.error(t('messages.imageTooBig'));
      return;
    }
    try {
      setUploadingLogo(true);
      const updated = await companySettingsService.uploadLogo(file);
      setSettings(updated);
      toastService.success(t('messages.logoUpdated'));
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.errorUploadingLogo'));
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const logoFullUrl = settings?.logoUrl ? getLogoFullUrl(settings.logoUrl) : null;
  const logoWithCacheBust = logoFullUrl && settings?.updatedAt
    ? `${logoFullUrl}?t=${new Date(settings.updatedAt).getTime()}`
    : logoFullUrl;

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loading size="lg" />
        </div>
      );
    }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/configuracion`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'rgb(var(--color-primary-800))' }}
          >
            {t('title')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-primary-500))' }}>
            {t('logo')}
          </label>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50"
              style={{ borderColor: 'rgb(var(--color-secondary-300))' }}
            >
              {logoWithCacheBust ? (
                <img src={logoWithCacheBust} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <PhotoIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Btn
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? tCommon('actions.loading') : t('changeLogo')}
              </Btn>
            </div>
          </div>
        </div>

        <Input
          label={t('name')}
          value={form.name}
          onChange={handleChange('name')}
          placeholder={t('namePlaceholder')}
        />
        <Input
          label={t('legalName')}
          value={form.legalName}
          onChange={handleChange('legalName')}
          placeholder={t('legalNamePlaceholder')}
        />
        <Input
          label={t('taxId')}
          value={form.taxId}
          onChange={handleChange('taxId')}
          placeholder={t('taxIdPlaceholder')}
        />
        <Input
          label={t('address')}
          value={form.address}
          onChange={handleChange('address')}
          placeholder={t('addressPlaceholder')}
        />
        <Input
          label={t('phone')}
          value={form.phone}
          onChange={handleChange('phone')}
          placeholder={t('phonePlaceholder')}
        />
        <Input
          label={t('email')}
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder={t('emailPlaceholder')}
        />
        <Input
          label={t('website')}
          value={form.website}
          onChange={handleChange('website')}
          placeholder={t('websitePlaceholder')}
        />

        <div className="flex gap-3 pt-2">
          <Btn type="submit" variant="primary" disabled={saving}>
            {saving ? tCommon('actions.saving') : tCommon('actions.save')}
          </Btn>
        </div>
      </form>
    </div>
  );
}
