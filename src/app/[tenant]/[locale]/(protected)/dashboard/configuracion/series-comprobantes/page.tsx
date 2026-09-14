'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Btn, EmptyState } from '@/components/atoms';
import { usePermissions } from '@/hooks/usePermissions';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import DocumentSeriesTable from '@/components/DocumentSeries/DocumentSeriesTable';
import DocumentSeriesForm, {
  DocumentSeriesFormRef,
} from '@/components/DocumentSeries/DocumentSeriesForm';
import { documentSeriesService } from '@/services/document-series.service';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';
import { DocumentSeries } from '@/types/document-series';

export default function DocumentSeriesPage() {
  const t = useTranslations('pages.documentSeries');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const [series, setSeries] = useState<DocumentSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  // El pack activo decide si esta pantalla aplica: solo los que numeran por
  // serie y correlativo (SUNAT) la necesitan.
  const [usesSeries, setUsesSeries] = useState<boolean | null>(null);
  const formRef = useRef<DocumentSeriesFormRef>(null);

  const canView = can(['certification_pack_module_view']);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { capabilities } = await certificationPackService.getCapabilities();
      setUsesSeries(capabilities.documentSeries);

      if (!capabilities.documentSeries) {
        setSeries([]);
        return;
      }

      setSeries((await documentSeriesService.getAll()) || []);
    } catch (error) {
      console.error('Error fetching document series:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (canView) {
      fetchData();
    }
  }, [canView, fetchData]);

  if (!canView) {
    return (
      <div className="p-6">
        <EmptyState
          title={tCommon('noPermission')}
          description={tCommon('noPermissionDescription')}
        />
      </div>
    );
  }

  const handleSetDefault = async (item: DocumentSeries) => {
    try {
      await documentSeriesService.update(item.id, { is_default: true });
      toastService.success(t('messages.successUpdated'));
      fetchData();
    } catch (error) {
      console.error('Error setting default series:', error);
      toastService.error(t('messages.errorSaving'));
    }
  };

  const handleToggleActive = async (item: DocumentSeries) => {
    try {
      await documentSeriesService.update(item.id, { is_active: !item.is_active });
      toastService.success(t('messages.successUpdated'));
      fetchData();
    } catch (error) {
      console.error('Error updating series:', error);
      toastService.error(t('messages.errorSaving'));
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setIsSaving(false);
    setIsFormValid(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        {usesSeries && (
          <Btn onClick={() => setShowDrawer(true)} leftIcon={<PlusIcon className="h-5 w-5" />}>
            {t('actions.create')}
          </Btn>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : usesSeries === false ? (
        <EmptyState
          title={t('notApplicable.title')}
          description={t('notApplicable.description')}
        />
      ) : series.length === 0 ? (
        <EmptyState title={t('noData')} description={t('noDataDesc')} />
      ) : (
        <div className="mt-6">
          <DocumentSeriesTable
            series={series}
            onSetDefault={handleSetDefault}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}

      <Drawer
        id="document-series-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={t('actions.create')}
        onSave={() => formRef.current?.submit()}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <DocumentSeriesForm
          ref={formRef}
          onSuccess={() => {
            handleDrawerClose();
            fetchData();
          }}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>
    </div>
  );
}
