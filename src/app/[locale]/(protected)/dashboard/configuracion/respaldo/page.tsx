'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowPathIcon, CloudArrowDownIcon, DocumentArrowDownIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Btn, Input, EmptyState } from '@/components/atoms';
import { backupService, toastService } from '@/services';
import { BackupConfig, BackupLog } from '@/types/backup';
import { usePermissions } from '@/hooks/usePermissions';
import Loading from '@/components/Loading/Loading';

export default function BackupPage() {
  const t = useTranslations('pages.backup');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const { can } = usePermissions();

  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);

  // Check permissions
  if (!can(['backup_module_view'])) {
    return (
      <div className="p-6">
        <EmptyState
          title={tCommon('noPermission')}
          description={tCommon('noPermissionDescription')}
        />
      </div>
    );
  }

  const fetchLogs = useCallback(async () => {
    try {
      const data = await backupService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const configData = await backupService.getConfig();
      setConfig(configData);
      await fetchLogs();
    } catch (error) {
      toastService.error(t('messages.errorLoadingHistory'));
    } finally {
      setLoading(false);
    }
  }, [fetchLogs, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      setSavingConfig(true);
      const updated = await backupService.updateConfig({
        isAutoEnabled: config.isAutoEnabled,
        frequency: config.frequency,
        scheduledTime: config.scheduledTime,
        retentionCount: config.retentionCount,
      });
      setConfig(updated);
      toastService.success(t('messages.configSaved'));
    } catch (error) {
      toastService.error(t('messages.backupError'));
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRunBackup = async () => {
    try {
      setRunningBackup(true);
      toastService.info(t('messages.backupStarted'));
      await backupService.runBackup();
      toastService.success(t('messages.backupSuccess'));
      await fetchLogs();
    } catch (error) {
      toastService.error(t('messages.backupError'));
    } finally {
      setRunningBackup(false);
    }
  };

  const handleDownload = (filename: string) => {
    const url = backupService.getDownloadUrl(filename);
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/configuracion`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{t('configuration')}</h2>
          </div>
          <form onSubmit={handleConfigUpdate} className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div>
                <span className="font-medium text-primary-900">{t('autoBackup')}</span>
                <p className="text-xs text-primary-700 mt-0.5">{t('autoBackupDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config?.isAutoEnabled}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, isAutoEnabled: e.target.checked }) : null)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('frequency')}</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-colors py-2 px-3"
                  value={config?.frequency}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, frequency: e.target.value as any }) : null)}
                >
                  <option value="daily">{t('frequencies.daily')}</option>
                  <option value="weekly">{t('frequencies.weekly')}</option>
                  <option value="monthly">{t('frequencies.monthly')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('scheduledTime')}</label>
                <input
                  type="time"
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-colors py-2 px-3"
                  value={config?.scheduledTime}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, scheduledTime: e.target.value }) : null)}
                />
              </div>
            </div>

            <Input
              label={t('retentionCount')}
              type="number"
              value={config?.retentionCount.toString()}
              onChange={(e) => setConfig(prev => prev ? ({ ...prev, retentionCount: parseInt(e.target.value) }) : null)}
            />

            <Btn type="submit" variant="primary" className="w-full" disabled={savingConfig}>
              {savingConfig ? tCommon('actions.saving') : tCommon('actions.save')}
            </Btn>
          </form>
        </div>

        {/* Manual Backup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
            <CloudArrowDownIcon className="h-5 w-5 text-secondary-600" />
            <h2 className="font-semibold text-gray-900">{t('manualBackup')}</h2>
          </div>
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-secondary-50 text-secondary-600 rounded-full flex items-center justify-center mb-6">
              <CloudArrowDownIcon className="h-10 w-10" />
            </div>
            <p className="text-gray-600 mb-8 max-w-sm">
              {t('manualBackupDesc')}
            </p>
            <Btn
              variant="secondary"
              className="w-full md:w-auto px-8"
              onClick={handleRunBackup}
              disabled={runningBackup}
              leftIcon={runningBackup ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <CloudArrowDownIcon className="h-5 w-5" />}
            >
              {runningBackup ? t('running') : t('runNow')}
            </Btn>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">{t('history')}</h2>
          </div>
          <button
            onClick={fetchLogs}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>{t('refresh')}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>{t('noLogs')}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">{t('table.date')}</th>
                  <th className="px-6 py-4">{t('table.filename')}</th>
                  <th className="px-6 py-4">{t('table.size')}</th>
                  <th className="px-6 py-4">{t('table.type')}</th>
                  <th className="px-6 py-4">{t('table.status')}</th>
                  <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {new Date(log.createdAt).toLocaleString(locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {log.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {log.fileSize || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.triggerType === 'automatic' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                        {t(`types.${log.triggerType}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status ? (
                        <span className="flex items-center text-green-600 space-x-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="font-medium text-xs">{t('status.success')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 space-x-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="font-medium text-xs font-mono" title={log.errorMessage || ''}>
                            {t('status.failure')}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {log.status && (
                        <button
                          onClick={() => handleDownload(log.filename)}
                          className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-all flex items-center space-x-1 ml-auto"
                          title={t('download')}
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{t('download')}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
