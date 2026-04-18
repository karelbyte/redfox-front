'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Webhook, webhookService } from '@/services/webhooks.service';
import { WebhookForm, WebhooksTable } from '@/components/Webhooks';
import { toastService } from '@/services/toast.service';
import { Btn } from '@/components/atoms';

const pageTranslations = {
  es: {
    title: 'Webhooks',
    description: 'Configura eventos que se enviarán a servicios externos',
    newWebhook: '+ Nuevo Webhook',
    createWebhook: 'Crear Nuevo Webhook',
    editWebhook: 'Editar Webhook',
    loading: 'Cargando webhooks...',
    noWebhooks: 'No hay webhooks configurados',
    infoTitle: '¿Qué son los Webhooks?',
    infoDescription:
      'Los webhooks te permiten recibir notificaciones en tiempo real cuando ocurren eventos en tu organización. Cada vez que se dispara un evento, Redfox envía una solicitud POST a la URL que configures.',
    infoEventsTitle: 'Eventos disponibles:',
    infoEvents: [
      'Venta Creada',
      'Factura Creada',
      'Recepción Creada',
      'Orden de Compra Aprobada',
      'Estado de Envío Cambió',
      'Cliente Creado',
      'Producto Creado',
    ],
    errorLoading: 'Error al cargar los webhooks',
    errorDeleting: 'Error al eliminar el webhook',
    deleteSuccess: 'Webhook eliminado correctamente',
    createSuccess: 'Webhook creado correctamente',
    updateSuccess: 'Webhook actualizado correctamente',
    errorSaving: 'Error al guardar el webhook',
  },
  en: {
    title: 'Webhooks',
    description: 'Configure events that will be sent to external services',
    newWebhook: '+ New Webhook',
    createWebhook: 'Create New Webhook',
    editWebhook: 'Edit Webhook',
    loading: 'Loading webhooks...',
    noWebhooks: 'No webhooks configured',
    infoTitle: 'What are Webhooks?',
    infoDescription:
      'Webhooks allow you to receive real-time notifications when events happen in your organization. When an event triggers, Redfox sends a POST request to the URL you configure.',
    infoEventsTitle: 'Available events:',
    infoEvents: [
      'Sale Created',
      'Invoice Created',
      'Reception Created',
      'Purchase Order Approved',
      'Shipment Status Changed',
      'Client Created',
      'Product Created',
    ],
    errorLoading: 'Error loading webhooks',
    errorDeleting: 'Error deleting webhook',
    deleteSuccess: 'Webhook deleted successfully',
    createSuccess: 'Webhook created successfully',
    updateSuccess: 'Webhook updated successfully',
    errorSaving: 'Error saving webhook',
  },
  zh: {
    title: 'Webhook',
    description: '配置将在组织事件发生时发送到外部服务的事件',
    newWebhook: '+ 新增 Webhook',
    createWebhook: '创建新 Webhook',
    editWebhook: '编辑 Webhook',
    loading: '正在加载 Webhook...',
    noWebhooks: '尚未配置 Webhook',
    infoTitle: '什么是 Webhook？',
    infoDescription:
      'Webhook 允许你在组织事件发生时接收实时通知。每当事件触发时，Redfox 会向你配置的 URL 发送 POST 请求。',
    infoEventsTitle: '可用事件：',
    infoEvents: [
      '销售已创建',
      '发票已创建',
      '收货已创建',
      '采购订单已批准',
      '发货状态已更改',
      '客户已创建',
      '产品已创建',
    ],
    errorLoading: '加载 Webhook 时出错',
    errorDeleting: '删除 Webhook 时出错',
    deleteSuccess: 'Webhook 删除成功',
    createSuccess: 'Webhook 创建成功',
    updateSuccess: 'Webhook 更新成功',
    errorSaving: '保存 Webhook 时出错',
  },
} as const;

export default function WebhooksPage() {
  const locale = useLocale();
  const localeKey = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es';
  const t = pageTranslations[localeKey];

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | undefined>();

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
      toastService.error(t.errorLoading);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await webhookService.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toastService.success(t.deleteSuccess);
    } catch (error) {
      console.error('Error al eliminar webhook:', error);
      toastService.error(t.errorDeleting);
    }
  };

  const handleSave = async (webhook: Webhook) => {
    await loadWebhooks();
    setShowForm(false);
    setSelectedWebhook(undefined);

    const message = selectedWebhook ? t.updateSuccess : t.createSuccess;
    toastService.success(message);
  };

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedWebhook(undefined);
  };

  const handleNewWebhook = () => {
    setSelectedWebhook(undefined);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 text-sm mt-2">{t.description}</p>
        </div>
        {!showForm && (
          <Btn onClick={handleNewWebhook} variant="primary" size="md">
            {t.newWebhook}
          </Btn>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedWebhook ? t.editWebhook : t.createWebhook}
          </h2>
          <WebhookForm
            webhook={selectedWebhook}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
            locale={localeKey}
          />
        </div>
      )}

      {/* Tabla */}
      {!showForm && (
        <>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">{t.loading}</p>
            </div>
          ) : (
            <WebhooksTable
              webhooks={webhooks}
              onDelete={handleDelete}
              onEdit={handleEdit}
              isLoading={isLoading}
              locale={localeKey}
            />
          )}
        </>
      )}

      {/* Información */}
      {!showForm && webhooks.length === 0 && !isLoading && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.infoTitle}</h3>
          <p className="text-blue-800 text-sm mb-4">{t.infoDescription}</p>
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">{t.infoEventsTitle}</h4>
          <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
            {t.infoEvents.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
