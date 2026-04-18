import { API_BASE_URL } from '@/lib/config';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  event: WebhookEvent;
  status: WebhookStatus;
  headers?: Record<string, string>;
  retry_count: number;
  timeout_ms: number;
  created_at: Date;
  updated_at: Date;
  last_triggered_at?: Date;
  failure_count: number;
  last_error?: string;
}

export enum WebhookEvent {
  SALE_CREATED = 'sale_created',
  INVOICE_CREATED = 'invoice_created',
  RECEPTION_CREATED = 'reception_created',
  PURCHASE_ORDER_APPROVED = 'purchase_order_approved',
  SHIPMENT_STATUS_CHANGED = 'shipment_status_changed',
  CLIENT_CREATED = 'client_created',
  PRODUCT_CREATED = 'product_created',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
}

const baseURL = `${API_BASE_URL}/api/webhooks`;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    
    const segments = window.location.pathname.split('/').filter(Boolean);
    const locales = ['es', 'en', 'zh'];
    const firstIsLocale = locales.includes(segments[0]);
    const tenant = firstIsLocale ? null : segments[0];
    const locale = firstIsLocale ? segments[0] : (segments[1] || 'es');

    if (tenant) {
      headers['X-Tenant-Slug'] = tenant;
    }
    headers['X-Locale'] = locale;
  }

  return headers;
};

const handleError = (error: any) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpires');
      localStorage.removeItem('user');
      
      const segments = window.location.pathname.split('/').filter(Boolean);
      const locales = ['es', 'en', 'zh'];
      const firstIsLocale = locales.includes(segments[0]);
      const tenant = firstIsLocale ? null : segments[0];
      const locale = firstIsLocale ? segments[0] : (segments[1] || 'es');

      if (tenant) {
        window.location.href = `/${tenant}/${locale}/login`;
      } else {
        window.location.href = `/${locale}/login`;
      }
    }
  }
  throw error;
};

export const webhookService = {
  /**
   * Obtener todos los webhooks de la organización
   */
  async getWebhooks(): Promise<Webhook[]> {
    try {
      const response = await fetch(baseURL, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear un nuevo webhook
   */
  async createWebhook(webhookData: Partial<Webhook>): Promise<Webhook> {
    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar un webhook existente
   */
  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Eliminar un webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener eventos disponibles
   */
  getAvailableEvents(): { value: WebhookEvent; label: string }[] {
    return [
      { value: WebhookEvent.SALE_CREATED, label: 'Venta Creada' },
      { value: WebhookEvent.INVOICE_CREATED, label: 'Factura Creada' },
      { value: WebhookEvent.RECEPTION_CREATED, label: 'Recepción Creada' },
      { value: WebhookEvent.PURCHASE_ORDER_APPROVED, label: 'Orden de Compra Aprobada' },
      { value: WebhookEvent.SHIPMENT_STATUS_CHANGED, label: 'Estado de Envío Cambió' },
      { value: WebhookEvent.CLIENT_CREATED, label: 'Cliente Creado' },
      { value: WebhookEvent.PRODUCT_CREATED, label: 'Producto Creado' },
    ];
  },

  /**
   * Obtener estados disponibles
   */
  getAvailableStatuses(): { value: WebhookStatus; label: string }[] {
    return [
      { value: WebhookStatus.ACTIVE, label: 'Activo' },
      { value: WebhookStatus.INACTIVE, label: 'Inactivo' },
      { value: WebhookStatus.FAILED, label: 'Fallido' },
    ];
  },
};
