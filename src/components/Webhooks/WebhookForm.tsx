'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Webhook, WebhookEvent, WebhookStatus, webhookService } from '@/services/webhooks.service';

export interface WebhookFormRef {
  submit: () => void;
  reset: () => void;
}

export interface WebhookFormProps {
  webhook: Webhook | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
  locale: string;
}

interface FormData {
  name: string;
  url: string;
  event: WebhookEvent;
  status: WebhookStatus;
  retry_count: number;
  timeout_ms: number;
  headers: string; // JSON string
}

const webhookFormTranslations = {
  es: {
    labels: {
      name: 'Nombre',
      url: 'URL del Webhook',
      event: 'Evento a disparar',
      status: 'Estado',
      retryCount: 'Reintentos',
      timeout: 'Timeout (ms)',
      headers: 'Headers personalizados (JSON)',
      create: 'Crear',
      update: 'Actualizar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
    },
    placeholders: {
      name: 'Ej: Webhook de ventas',
      url: 'https://example.com/webhook',
      headers: '{"Authorization": "Bearer token", "X-Custom": "value"}',
    },
    errors: {
      requiredName: 'El nombre es requerido',
      requiredUrl: 'La URL es requerida',
      invalidUrl: 'URL inválida',
      retryCountRange: 'El número de reintentos debe estar entre 0 y 10',
      timeoutRange: 'El timeout debe estar entre 1000ms y 30000ms',
      invalidHeaders: 'Headers debe ser un JSON válido',
      saveError: 'Error al guardar el webhook',
    },
  },
  en: {
    labels: {
      name: 'Name',
      url: 'Webhook URL',
      event: 'Event to trigger',
      status: 'Status',
      retryCount: 'Retry count',
      timeout: 'Timeout (ms)',
      headers: 'Custom headers (JSON)',
      create: 'Create',
      update: 'Update',
      saving: 'Saving...',
      cancel: 'Cancel',
    },
    placeholders: {
      name: 'E.g.: Sales webhook',
      url: 'https://example.com/webhook',
      headers: '{"Authorization": "Bearer token", "X-Custom": "value"}',
    },
    errors: {
      requiredName: 'Name is required',
      requiredUrl: 'URL is required',
      invalidUrl: 'Invalid URL',
      retryCountRange: 'Retry count must be between 0 and 10',
      timeoutRange: 'Timeout must be between 1000ms and 30000ms',
      invalidHeaders: 'Headers must be valid JSON',
      saveError: 'Error saving webhook',
    },
  },
  zh: {
    labels: {
      name: '名称',
      url: 'Webhook URL',
      event: '触发事件',
      status: '状态',
      retryCount: '重试次数',
      timeout: '超时 (ms)',
      headers: '自定义 Headers (JSON)',
      create: '创建',
      update: '更新',
      saving: '保存中...',
      cancel: '取消',
    },
    placeholders: {
      name: '例如：销售 Webhook',
      url: 'https://example.com/webhook',
      headers: '{"Authorization": "Bearer token", "X-Custom": "value"}',
    },
    errors: {
      requiredName: '名称为必填项',
      requiredUrl: 'URL 为必填项',
      invalidUrl: 'URL 无效',
      retryCountRange: '重试次数必须在 0 到 10 之间',
      timeoutRange: '超时必须在 1000ms 到 30000ms 之间',
      invalidHeaders: 'Headers 必须是有效的 JSON',
      saveError: '保存 Webhook 时出错',
    },
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

const statusLabelsByLocale = {
  es: {
    active: 'Activo',
    inactive: 'Inactivo',
    failed: 'Fallido',
  },
  en: {
    active: 'Active',
    inactive: 'Inactive',
    failed: 'Failed',
  },
  zh: {
    active: '已激活',
    inactive: '未激活',
    failed: '失败',
  },
} as const;

export const WebhookForm = forwardRef<WebhookFormRef, WebhookFormProps>(
  ({ webhook, onSuccess, onSavingChange, onValidChange, locale }, ref) => {
    const localeKey = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'es';
    const t = webhookFormTranslations[localeKey];

    const [formData, setFormData] = useState<FormData>({
      name: webhook?.name || '',
      url: webhook?.url || '',
      event: webhook?.event || WebhookEvent.SALE_CREATED,
      status: webhook?.status || WebhookStatus.ACTIVE,
      retry_count: webhook?.retry_count || 3,
      timeout_ms: webhook?.timeout_ms || 5000,
      headers: JSON.stringify(webhook?.headers || {}, null, 2),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const availableEvents = webhookService.getAvailableEvents();
    const availableStatuses = webhookService.getAvailableStatuses();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.requiredName;
    }

    if (!formData.url.trim()) {
      newErrors.url = t.errors.requiredUrl;
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = t.errors.invalidUrl;
    }

    if (formData.retry_count < 0 || formData.retry_count > 10) {
      newErrors.retry_count = t.errors.retryCountRange;
    }

    if (formData.timeout_ms < 1000 || formData.timeout_ms > 30000) {
      newErrors.timeout_ms = t.errors.timeoutRange;
    }

    try {
      JSON.parse(formData.headers);
    } catch {
      newErrors.headers = t.errors.invalidHeaders;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidChange?.(isValid);
    return isValid;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'retry_count' || name === 'timeout_ms' ? parseInt(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    onSavingChange?.(true);

    try {
      const webhookData = {
        ...formData,
        headers: JSON.parse(formData.headers),
      };

      if (webhook?.id) {
        await webhookService.updateWebhook(webhook.id, webhookData);
      } else {
        await webhookService.createWebhook(webhookData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar webhook:', error);
      setErrors({ submit: t.errors.saveError });
    } finally {
      setIsSaving(false);
      onSavingChange?.(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: webhook?.name || '',
      url: webhook?.url || '',
      event: webhook?.event || WebhookEvent.SALE_CREATED,
      status: webhook?.status || WebhookStatus.ACTIVE,
      retry_count: webhook?.retry_count || 3,
      timeout_ms: webhook?.timeout_ms || 5000,
      headers: JSON.stringify(webhook?.headers || {}, null, 2),
    });
    setErrors({});
    onValidChange?.(true);
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleReset,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.labels.name}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder={t.placeholders.name}
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.labels.url}
          </label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder={t.placeholders.url}
          />
          {errors.url && <p className="text-red-600 text-xs mt-1">{errors.url}</p>}
        </div>

        {/* Evento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.labels.event}
          </label>
          <select
            name="event"
            value={formData.event}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableEvents.map((evt) => (
              <option key={evt.value} value={evt.value}>
                {eventLabelsByLocale[localeKey][evt.value] ?? evt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.labels.status}
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {statusLabelsByLocale[localeKey][status.value] ?? status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reintentos y Timeout */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.labels.retryCount}
            </label>
            <input
              type="number"
              name="retry_count"
              value={formData.retry_count}
              onChange={handleChange}
              min="0"
              max="10"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.retry_count ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.retry_count && (
              <p className="text-red-600 text-xs mt-1">{errors.retry_count}</p>
            )}
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.labels.timeout}
            </label>
            <input
              type="number"
              name="timeout_ms"
              value={formData.timeout_ms}
              onChange={handleChange}
              min="1000"
              max="30000"
              step="1000"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.timeout_ms ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.timeout_ms && (
              <p className="text-red-600 text-xs mt-1">{errors.timeout_ms}</p>
            )}
          </div>
        </div>

        {/* Headers JSON */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.labels.headers}
          </label>
          <textarea
            name="headers"
            value={formData.headers}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
              errors.headers ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder={t.placeholders.headers}
          />
          {errors.headers && <p className="text-red-600 text-xs mt-1">{errors.headers}</p>}
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
});
