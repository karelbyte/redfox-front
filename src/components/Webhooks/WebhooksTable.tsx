'use client';

import React from 'react';
import { Webhook } from '@/services/webhooks.service';
import { WebhookStatusBadge } from './WebhookStatusBadge';
import { Btn } from '@/components/atoms';

interface WebhooksTableProps {
  webhooks: Webhook[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (webhook: Webhook) => void;
  isLoading: boolean;
  locale: string;
}

const webhookTableTranslations = {
  es: {
    headers: {
      name: 'Nombre',
      event: 'Evento',
      url: 'URL',
      status: 'Estado',
      lastTriggered: 'Último disparo',
      actions: 'Acciones',
    },
    noWebhooks: 'No hay webhooks configurados',
    confirmDelete: '¿Estás seguro de que deseas eliminar este webhook?',
    editButton: 'Editar',
    deleteButton: 'Eliminar',
    deletingButton: 'Eliminando...',
    dateLocale: 'es-ES',
  },
  en: {
    headers: {
      name: 'Name',
      event: 'Event',
      url: 'URL',
      status: 'Status',
      lastTriggered: 'Last triggered',
      actions: 'Actions',
    },
    noWebhooks: 'No webhooks configured',
    confirmDelete: 'Are you sure you want to delete this webhook?',
    editButton: 'Edit',
    deleteButton: 'Delete',
    deletingButton: 'Deleting...',
    dateLocale: 'en-US',
  },
  zh: {
    headers: {
      name: '名称',
      event: '事件',
      url: 'URL',
      status: '状态',
      lastTriggered: '最近触发',
      actions: '操作',
    },
    noWebhooks: '尚未配置 Webhook',
    confirmDelete: '您确定要删除此 Webhook 吗？',
    editButton: '编辑',
    deleteButton: '删除',
    deletingButton: '删除中...',
    dateLocale: 'zh-CN',
  },
} as const;

const eventLabelsByLocale = {
  es: {
    sale_created: 'Venta Creada',
    invoice_created: 'Factura Creada',
    reception_created: 'Recepción Creada',
    purchase_order_approved: 'Orden de Compra Aprobada',
    shipment_status_changed: 'Estado de Envío Cambió',
    client_created: 'Cliente Creado',
    product_created: 'Producto Creado',
  },
  en: {
    sale_created: 'Sale Created',
    invoice_created: 'Invoice Created',
    reception_created: 'Reception Created',
    purchase_order_approved: 'Purchase Order Approved',
    shipment_status_changed: 'Shipment Status Changed',
    client_created: 'Client Created',
    product_created: 'Product Created',
  },
  zh: {
    sale_created: '销售已创建',
    invoice_created: '发票已创建',
    reception_created: '收货已创建',
    purchase_order_approved: '采购订单已批准',
    shipment_status_changed: '发货状态已更改',
    client_created: '客户已创建',
    product_created: '产品已创建',
  },
} as const;

export const WebhooksTable: React.FC<WebhooksTableProps> = ({
  webhooks,
  onDelete,
  onEdit,
  isLoading,
  locale,
}) => {
  const localeKey = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es';
  const t = webhookTableTranslations[localeKey];
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(t.confirmDelete)) {
      try {
        await onDelete(id);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  if (webhooks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">{t.noWebhooks}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.name}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.event}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.url}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.status}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.lastTriggered}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {t.headers.actions}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <tr key={webhook.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {webhook.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {eventLabelsByLocale[localeKey][webhook.event] ?? webhook.event}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="max-w-xs truncate">{webhook.url}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <WebhookStatusBadge status={webhook.status} locale={localeKey} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {webhook.last_triggered_at
                  ? new Date(webhook.last_triggered_at).toLocaleDateString(t.dateLocale)
                  : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Btn onClick={() => onEdit(webhook)} variant="ghost" size="sm">
                  {t.editButton}
                </Btn>
                <Btn
                  onClick={() => handleDelete(webhook.id)}
                  variant="danger"
                  size="sm"
                  disabled={deleteId === webhook.id}
                >
                  {deleteId === webhook.id ? t.deletingButton : t.deleteButton}
                </Btn>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
