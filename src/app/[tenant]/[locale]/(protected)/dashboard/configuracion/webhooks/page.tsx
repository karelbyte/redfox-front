'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Webhook, webhookService } from '@/services/webhooks.service';
import { WebhookForm, WebhooksTable } from '@/components/Webhooks';
import { toastService } from '@/services/toast.service';
import { Btn, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';
import Drawer from '@/components/Drawer/Drawer';
import { WebhookFormRef } from '@/components/Webhooks/WebhookForm';
import HelpButton from '@/components/Help/HelpButton';
import { webhooksHelp } from '@/components/Help/configs/webhooks.help';

export default function WebhooksPage() {
  const locale = useLocale();
  const { can } = usePermissions();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<WebhookFormRef>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await webhookService.getWebhooks();
      setWebhooks(data);
    } catch (error) {
      console.error('Error al cargar webhooks:', error);
      toastService.error(getTranslation('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await webhookService.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toastService.success(getTranslation('deleteSuccess'));
    } catch (error) {
      console.error('Error al eliminar webhook:', error);
      toastService.error(getTranslation('errorDeleting'));
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowDrawer(true);
  };

  const handleNewWebhook = () => {
    setSelectedWebhook(null);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setSelectedWebhook(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    loadWebhooks();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const getTranslation = (key: string) => {
    const translations = {
      es: {
        title: 'Webhooks',
        description: 'Configura notificaciones automáticas para integrar con servicios externos',
        newWebhook: 'Nuevo Webhook',
        createWebhook: 'Crear Nuevo Webhook',
        editWebhook: 'Editar Webhook',
        loading: 'Cargando webhooks...',
        noWebhooks: 'No hay webhooks configurados',
        noWebhooksDesc: 'Configura webhooks para recibir notificaciones automáticas cuando ocurran eventos en tu organización.',
        errorLoading: 'Error al cargar los webhooks',
        errorDeleting: 'Error al eliminar el webhook',
        deleteSuccess: 'Webhook eliminado correctamente',
        createSuccess: 'Webhook creado correctamente',
        updateSuccess: 'Webhook actualizado correctamente',
        errorSaving: 'Error al guardar el webhook',
        noPermission: 'No tienes permisos para ver esta página',
      },
      en: {
        title: 'Webhooks',
        description: 'Configure automatic notifications to integrate with external services',
        newWebhook: 'New Webhook',
        createWebhook: 'Create New Webhook',
        editWebhook: 'Edit Webhook',
        loading: 'Loading webhooks...',
        noWebhooks: 'No webhooks configured',
        noWebhooksDesc: 'Configure webhooks to receive automatic notifications when events occur in your organization.',
        errorLoading: 'Error loading webhooks',
        errorDeleting: 'Error deleting webhook',
        deleteSuccess: 'Webhook deleted successfully',
        createSuccess: 'Webhook created successfully',
        updateSuccess: 'Webhook updated successfully',
        errorSaving: 'Error saving webhook',
        noPermission: 'You do not have permission to view this page',
      },
      zh: {
        title: 'Webhook',
        description: '配置自动通知以与外部服务集成',
        newWebhook: '新增 Webhook',
        createWebhook: '创建新 Webhook',
        editWebhook: '编辑 Webhook',
        loading: '正在加载 Webhook...',
        noWebhooks: '尚未配置 Webhook',
        noWebhooksDesc: '配置webhook以在组织中发生事件时接收自动通知。',
        errorLoading: '加载 Webhook 时出错',
        errorDeleting: '删除 Webhook 时出错',
        deleteSuccess: 'Webhook 删除成功',
        createSuccess: 'Webhook 创建成功',
        updateSuccess: 'Webhook 更新成功',
        errorSaving: '保存 Webhook 时出错',
        noPermission: '您没有查看此页面的权限',
      },
    };

    const localeKey = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es';
    return translations[localeKey][key as keyof typeof translations[typeof localeKey]] || key;
  };

  if (!can(['webhooks_module_view'])) {
    return <div className="p-6">{getTranslation('noPermission')}</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {getTranslation('title')}
          </h1>
          <HelpButton config={webhooksHelp} />
        </div>
        {can(['webhook_create']) && (
          <Btn
            onClick={handleNewWebhook}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {getTranslation('newWebhook')}
          </Btn>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mt-2 mb-6">
        {getTranslation('description')}
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : webhooks.length === 0 ? (
        <EmptyState
          title={getTranslation('noWebhooks')}
          description={getTranslation('noWebhooksDesc')}
        />
      ) : (
        <div className="mt-6">
          <WebhooksTable
            webhooks={webhooks}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isLoading={isLoading}
            locale={locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es'}
          />
        </div>
      )}

      {/* Drawer para crear/editar */}
      <Drawer
        id="webhook-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedWebhook ? getTranslation('editWebhook') : getTranslation('createWebhook')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <WebhookForm
          ref={formRef}
          webhook={selectedWebhook}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
          locale={locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es'}
        />
      </Drawer>
    </div>
  );
}
