'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import HelpButton from '@/components/Help/HelpButton';
import { botAssistantHelp } from '@/components/Help/configs/bot-assistant.help';
import Loading from '@/components/Loading/Loading';
import { Btn, Checkbox, EmptyState, Input, Select, TextArea } from '@/components/atoms';
import { usePermissions } from '@/hooks/usePermissions';
import { botSettingsService } from '@/services/bot-settings.service';
import { companySettingsService } from '@/services/company-settings.service';
import { toastService } from '@/services/toast.service';
import {
  BotConnectionStatus,
  BotProvider,
  BotSettings,
  BotTone,
  CloudProviderConfig,
} from '@/types/bot-settings';
import { CompanySettings } from '@/types/company-settings';

type BotFormState = {
  isEnabled: boolean;
  autoReplyEnabled: boolean;
  quotationModeEnabled: boolean;
  assistantName: string;
  defaultLanguage: string;
  tone: BotTone;
  welcomeMessage: string;
  handoffMessage: string;
  quotationPrompt: string;
  cloudConfig: CloudProviderConfig;
};

const createFormState = (settings: BotSettings): BotFormState => ({
  isEnabled: settings.isEnabled,
  autoReplyEnabled: settings.autoReplyEnabled,
  quotationModeEnabled: settings.quotationModeEnabled,
  assistantName: settings.assistantName ?? '',
  defaultLanguage: settings.defaultLanguage || 'es',
  tone: settings.tone,
  welcomeMessage: settings.welcomeMessage ?? '',
  handoffMessage: settings.handoffMessage ?? '',
  quotationPrompt: settings.quotationPrompt ?? '',
  cloudConfig: settings.cloudConfig ?? {},
});

export default function WhatsAppBotPage() {
  const t = useTranslations('pages.botAssistant');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const canUpdateSettings = can(['bot_update']);
  const canConnectBaileys = can(['bot_connect']);
  const canDisconnectBaileys = can(['bot_disconnect']);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    'provider' | 'connect' | 'refresh' | 'disconnect' | null
  >(null);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [form, setForm] = useState<BotFormState | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);


  useEffect(() => {
    void loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!settings || !['connecting', 'qr_ready', 'connected'].includes(settings.connectionStatus)) {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshStatus();
    }, settings.connectionStatus === 'connected' ? 10000 : 4000);

    return () => window.clearInterval(interval);
  }, [settings]);

  if (!can(['bot_module_view'])) {
    return (
      <div className="p-6">
        <EmptyState
          title={tCommon('noPermission')}
          description={tCommon('noPermissionDescription')}
        />
      </div>
    );
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      const [botData, companyData] = await Promise.all([
        botSettingsService.get(),
        companySettingsService.get().catch(() => null),
      ]);

      setSettings(botData);
      setForm(createFormState(botData));
      setCompany(companyData);
    } catch (error) {
      toastService.error(
        error instanceof Error ? error.message : t('messages.errorLoading'),
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    try {
      const botData = await botSettingsService.get();
      setSettings(botData);
    } catch (error) {
      console.error('Error refreshing bot status:', error);
    }
  }

  async function handleProviderSelect(provider: BotProvider) {
    if (!settings || settings.provider === provider || !canUpdateSettings) {
      return;
    }

    try {
      setActionLoading('provider');
      const updated = await botSettingsService.selectProvider(provider);
      setSettings(updated);
      setForm(createFormState(updated));
      toastService.success(t('messages.providerUpdated'));
    } catch (error) {
      toastService.error(
        error instanceof Error ? error.message : t('messages.errorUpdatingProvider'),
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !canUpdateSettings) return;

    try {
      setSaving(true);
      const updated = await botSettingsService.update({
        isEnabled: form.isEnabled,
        autoReplyEnabled: form.autoReplyEnabled,
        quotationModeEnabled: form.quotationModeEnabled,
        assistantName: form.assistantName,
        defaultLanguage: form.defaultLanguage,
        tone: form.tone,
        welcomeMessage: form.welcomeMessage,
        handoffMessage: form.handoffMessage,
        quotationPrompt: form.quotationPrompt,
        cloudConfig: form.cloudConfig,
      });
      setSettings(updated);
      setForm(createFormState(updated));
      toastService.success(t('messages.saved'));
    } catch (error) {
      toastService.error(
        error instanceof Error ? error.message : t('messages.errorSaving'),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleBaileysAction(
    action: 'connect' | 'refresh' | 'disconnect',
  ) {
    if (
      (action === 'disconnect' && !canDisconnectBaileys) ||
      (action !== 'disconnect' && !canConnectBaileys)
    ) {
      return;
    }

    try {
      setActionLoading(action);
      const updated =
        action === 'connect'
          ? await botSettingsService.connectBaileys()
          : action === 'refresh'
            ? await botSettingsService.refreshBaileysQr()
            : await botSettingsService.disconnectBaileys();

      setSettings(updated);
      toastService.success(
        action === 'disconnect'
          ? t('messages.disconnected')
          : action === 'refresh'
            ? t('messages.qrRefreshed')
            : t('messages.connectionStarted'),
      );
    } catch (error) {
      toastService.error(
        error instanceof Error ? error.message : t('messages.errorConnecting'),
      );
    } finally {
      setActionLoading(null);
    }
  }

  function updateForm<K extends keyof BotFormState>(field: K, value: BotFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function updateCloudConfig(field: keyof CloudProviderConfig, value: string) {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            cloudConfig: {
              ...(prev.cloudConfig ?? {}),
              [field]: value,
            },
          }
        : prev,
    );
  }

  if (loading || !settings || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const statusMeta = getStatusMeta(settings.connectionStatus, t);
  const providerSteps =
    settings.provider === 'baileys'
      ? [
          t('providers.baileys.steps.openPhone'),
          t('providers.baileys.steps.linkedDevices'),
          t('providers.baileys.steps.scanQr'),
          t('providers.baileys.steps.waitConnected'),
          t('providers.baileys.steps.testMessage'),
        ]
      : [
          t('providers.cloud.steps.metaLogin'),
          t('providers.cloud.steps.selectBusiness'),
          t('providers.cloud.steps.connectNumber'),
          t('providers.cloud.steps.authorize'),
          t('providers.cloud.steps.completeConfig'),
        ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>
            {t('title')}
          </h1>
          <HelpButton config={botAssistantHelp} />
        </div>
        <StatusBadge meta={statusMeta} />
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'rgb(var(--color-primary-200))', background: 'linear-gradient(135deg, rgba(var(--color-primary-50), 0.95), rgba(var(--color-secondary-100), 0.9))' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgb(var(--color-primary-500))' }}>{t('eyebrow')}</p>
            <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>{t('headline')}</h2>
            <p className="text-sm leading-6 text-gray-600">{t('subheadline')}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <SummaryCard icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} title={t('summary.provider')} value={settings.provider === 'baileys' ? t('providers.baileys.title') : t('providers.cloud.title')} />
            <SummaryCard icon={<ShieldCheckIcon className="h-5 w-5" />} title={t('summary.company')} value={company?.name || company?.legalName || t('summary.companyPending')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
            <SectionHeader title={t('providerSection.title')} description={t('providerSection.description')} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProviderCard title={t('providers.baileys.title')} badge={t('providers.baileys.badge')} description={t('providers.baileys.description')} provider="baileys" selected={settings.provider === 'baileys'} onSelect={handleProviderSelect} loading={actionLoading === 'provider'} disabled={!canUpdateSettings} bullets={[t('providers.baileys.bullets.qr'), t('providers.baileys.bullets.beta'), t('providers.baileys.bullets.testing')]} />
              <ProviderCard title={t('providers.cloud.title')} badge={t('providers.cloud.badge')} description={t('providers.cloud.description')} provider="whatsapp_cloud" selected={settings.provider === 'whatsapp_cloud'} onSelect={handleProviderSelect} loading={actionLoading === 'provider'} disabled={!canUpdateSettings} bullets={[t('providers.cloud.bullets.official'), t('providers.cloud.bullets.meta'), t('providers.cloud.bullets.prepared')]} />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <SectionHeader title={t('setupSection.title')} description={settings.provider === 'baileys' ? t('providers.baileys.setupDescription') : t('providers.cloud.setupDescription')} compact />
              {settings.provider === 'baileys' && (
                <div className="flex flex-wrap gap-2">
                  <Btn variant="secondary" onClick={() => handleBaileysAction('connect')} loading={actionLoading === 'connect'} leftIcon={<QrCodeIcon className="h-4 w-4" />} disabled={!canConnectBaileys}>{t('actions.connectBaileys')}</Btn>
                  <Btn variant="outline" onClick={() => handleBaileysAction('refresh')} loading={actionLoading === 'refresh'} leftIcon={<ArrowPathIcon className="h-4 w-4" />} disabled={!canConnectBaileys}>{t('actions.refreshQr')}</Btn>
                  <Btn variant="ghost" onClick={() => handleBaileysAction('disconnect')} loading={actionLoading === 'disconnect'} disabled={!canDisconnectBaileys}>{t('actions.disconnect')}</Btn>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--color-primary-700))' }}>{t('setupSection.stepsTitle')}</h4>
                <ol className="space-y-3">
                  {providerSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgb(var(--color-primary-100))', color: 'rgb(var(--color-primary-700))' }}>{index + 1}</span>
                      <span className="text-sm text-gray-600 leading-6">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {settings.provider === 'baileys' ? (
                <div className="rounded-xl border p-4 min-h-[320px] flex flex-col" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--color-primary-700))' }}>{t('providers.baileys.qrTitle')}</h4>
                  {settings.qrCode ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                        <img src={settings.qrCode} alt={t('providers.baileys.qrAlt')} className="w-56 h-56 object-contain" />
                      </div>
                      <p className="text-xs text-center text-gray-500 max-w-sm">{t('providers.baileys.qrHint')}</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-sm">
                        <QrCodeIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(var(--color-primary-300))' }} />
                        <p className="text-sm text-gray-600">{t('providers.baileys.qrEmpty')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--color-secondary-200))', backgroundColor: 'rgb(var(--color-secondary-50))' }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--color-secondary-800))' }}>{t('providers.cloud.previewTitle')}</h4>
                  <p className="text-sm text-gray-600 leading-6">{t('providers.cloud.previewBody')}</p>
                </div>
              )}
            </div>
          </section>

          <form onSubmit={handleSave}>
            <section className="rounded-2xl border bg-white p-5 space-y-6" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
              <SectionHeader title={t('configurationSection.title')} description={t('configurationSection.description')} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Input label={t('fields.assistantName')} value={form.assistantName} onChange={(e) => updateForm('assistantName', e.target.value)} placeholder={t('fields.assistantNamePlaceholder')} disabled={!canUpdateSettings} />
                <Select label={t('fields.defaultLanguage')} options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }, { value: 'zh', label: '中文' }]} value={form.defaultLanguage} onChange={(e) => updateForm('defaultLanguage', e.target.value)} disabled={!canUpdateSettings} />
                <Select label={t('fields.tone')} options={[{ value: 'professional', label: t('tones.professional') }, { value: 'friendly', label: t('tones.friendly') }, { value: 'direct', label: t('tones.direct') }]} value={form.tone} onChange={(e) => updateForm('tone', e.target.value as BotTone)} disabled={!canUpdateSettings} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Checkbox checked={form.isEnabled} onChange={(e) => updateForm('isEnabled', e.target.checked)} label={t('fields.isEnabled')} helperText={t('fields.isEnabledHelp')} disabled={!canUpdateSettings} />
                <Checkbox checked={form.autoReplyEnabled} onChange={(e) => updateForm('autoReplyEnabled', e.target.checked)} label={t('fields.autoReplyEnabled')} helperText={t('fields.autoReplyEnabledHelp')} disabled={!canUpdateSettings} />
                <Checkbox checked={form.quotationModeEnabled} onChange={(e) => updateForm('quotationModeEnabled', e.target.checked)} label={t('fields.quotationModeEnabled')} helperText={t('fields.quotationModeEnabledHelp')} disabled={!canUpdateSettings} />
              </div>

              <TextArea label={t('fields.welcomeMessage')} value={form.welcomeMessage} onChange={(e) => updateForm('welcomeMessage', e.target.value)} rows={4} placeholder={t('fields.welcomeMessagePlaceholder')} disabled={!canUpdateSettings} />
              <TextArea label={t('fields.handoffMessage')} value={form.handoffMessage} onChange={(e) => updateForm('handoffMessage', e.target.value)} rows={3} placeholder={t('fields.handoffMessagePlaceholder')} disabled={!canUpdateSettings} />
              <TextArea label={t('fields.quotationPrompt')} value={form.quotationPrompt} onChange={(e) => updateForm('quotationPrompt', e.target.value)} rows={4} placeholder={t('fields.quotationPromptPlaceholder')} disabled={!canUpdateSettings} />

              {settings.provider === 'whatsapp_cloud' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Input label={t('fields.appId')} value={form.cloudConfig.appId ?? ''} onChange={(e) => updateCloudConfig('appId', e.target.value)} placeholder={t('fields.appIdPlaceholder')} disabled={!canUpdateSettings} />
                  <Input label={t('fields.businessAccountId')} value={form.cloudConfig.businessAccountId ?? ''} onChange={(e) => updateCloudConfig('businessAccountId', e.target.value)} placeholder={t('fields.businessAccountIdPlaceholder')} disabled={!canUpdateSettings} />
                  <Input label={t('fields.phoneNumberId')} value={form.cloudConfig.phoneNumberId ?? ''} onChange={(e) => updateCloudConfig('phoneNumberId', e.target.value)} placeholder={t('fields.phoneNumberIdPlaceholder')} disabled={!canUpdateSettings} />
                  <Input label={t('fields.verifyToken')} value={form.cloudConfig.verifyToken ?? ''} onChange={(e) => updateCloudConfig('verifyToken', e.target.value)} placeholder={t('fields.verifyTokenPlaceholder')} disabled={!canUpdateSettings} />
                  <div className="lg:col-span-2">
                    <Input label={t('fields.accessToken')} value={form.cloudConfig.accessToken ?? ''} onChange={(e) => updateCloudConfig('accessToken', e.target.value)} placeholder={t('fields.accessTokenPlaceholder')} disabled={!canUpdateSettings} />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Btn type="submit" loading={saving} disabled={!canUpdateSettings}>{t('actions.save')}</Btn>
              </div>
            </section>
          </form>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
            <SectionHeader title={t('statusCard.title')} compact />
            <div className="space-y-3 text-sm">
              <StatusRow label={t('statusCard.provider')}>{settings.provider === 'baileys' ? t('providers.baileys.title') : t('providers.cloud.title')}</StatusRow>
              <StatusRow label={t('statusCard.connection')}>{statusMeta.label}</StatusRow>
              <StatusRow label={t('statusCard.phone')}>{settings.connectionMeta?.phoneNumber || t('statusCard.pending')}</StatusRow>
              <StatusRow label={t('statusCard.lastConnected')}>{settings.lastConnectedAt ? new Date(settings.lastConnectedAt).toLocaleString() : t('statusCard.pending')}</StatusRow>
            </div>
            {settings.lastError && (
              <div className="mt-4 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: 'rgb(var(--color-primary-200))', backgroundColor: 'rgba(var(--color-primary-500), 0.06)', color: 'rgb(var(--color-primary-700))' }}>{settings.lastError}</div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: 'rgb(var(--color-primary-100))' }}>
            <SectionHeader title={t('companyContext.title')} compact />
            <div className="space-y-3 text-sm">
              <StatusRow label={t('companyContext.company')}>{company?.name || company?.legalName || t('companyContext.empty')}</StatusRow>
              <StatusRow label={t('companyContext.phone')}>{company?.phone || t('companyContext.empty')}</StatusRow>
              <StatusRow label={t('companyContext.email')}>{company?.email || t('companyContext.empty')}</StatusRow>
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-6">{t('companyContext.description')}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, compact = false }: { title: string; description?: string; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'mb-4'}>
      <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-primary-700))' }}>{title}</h3>
      {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
    </div>
  );
}

function ProviderCard({ title, badge, description, provider, selected, loading, disabled = false, bullets, onSelect }: { title: string; badge: string; description: string; provider: BotProvider; selected: boolean; loading: boolean; disabled?: boolean; bullets: string[]; onSelect: (provider: BotProvider) => void }) {
  return (
    <button type="button" onClick={() => onSelect(provider)} className="text-left rounded-2xl border p-4 transition-all disabled:cursor-not-allowed disabled:opacity-70" style={{ borderColor: selected ? 'rgb(var(--color-primary-400))' : 'rgb(var(--color-primary-100))', backgroundColor: selected ? 'rgba(var(--color-primary-500), 0.06)' : 'white' }} disabled={loading || disabled}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-base font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>{title}</h4>
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ backgroundColor: 'rgb(var(--color-secondary-100))', color: 'rgb(var(--color-secondary-800))' }}>{badge}</span>
      </div>
      <p className="text-sm text-gray-600 leading-6 mb-4">{description}</p>
      <div className="space-y-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2 text-sm text-gray-500">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function StatusBadge({ meta }: { meta: ReturnType<typeof getStatusMeta> }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: meta.borderColor, color: meta.textColor, backgroundColor: meta.backgroundColor }}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dotColor }} />
      {meta.label}
    </div>
  );
}

function SummaryCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white/75 px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.55)' }}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--color-primary-100))', color: 'rgb(var(--color-primary-700))' }}>{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">{title}</p>
          <p className="text-sm font-semibold text-gray-700">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-700">{children}</span>
    </div>
  );
}

function getStatusMeta(
  status: BotConnectionStatus,
  t: ReturnType<typeof useTranslations<'pages.botAssistant'>>,
) {
  switch (status) {
    case 'connected':
      return { label: t('statuses.connected'), borderColor: 'rgba(5, 150, 105, 0.25)', textColor: '#065f46', backgroundColor: 'rgba(5, 150, 105, 0.08)', dotColor: '#059669' };
    case 'qr_ready':
      return { label: t('statuses.qrReady'), borderColor: 'rgba(217, 119, 6, 0.25)', textColor: '#92400e', backgroundColor: 'rgba(245, 158, 11, 0.10)', dotColor: '#f59e0b' };
    case 'connecting':
      return { label: t('statuses.connecting'), borderColor: 'rgba(59, 130, 246, 0.25)', textColor: '#1d4ed8', backgroundColor: 'rgba(59, 130, 246, 0.08)', dotColor: '#2563eb' };
    case 'error':
      return { label: t('statuses.error'), borderColor: 'rgba(220, 38, 38, 0.20)', textColor: '#991b1b', backgroundColor: 'rgba(220, 38, 38, 0.08)', dotColor: '#dc2626' };
    default:
      return { label: t('statuses.disconnected'), borderColor: 'rgba(107, 114, 128, 0.20)', textColor: '#374151', backgroundColor: 'rgba(107, 114, 128, 0.08)', dotColor: '#6b7280' };
  }
}

