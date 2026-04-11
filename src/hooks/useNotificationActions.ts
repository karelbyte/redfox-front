import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType, NotificationPriority, CreateNotificationDto } from '@/types/notification';
import { notificationService } from '@/services/notifications.service';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();
  const params = useParams();
  const tenant = params?.tenant;
  const locale = params?.locale;

  const showNotification = useCallback(async (data: CreateNotificationDto) => {
    try {
      const notification = await notificationService.createNotification(data);
      addNotification(notification);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [addNotification]);

  const getBaseUrl = useCallback(() => {
    if (!tenant || !locale) return '';
    return `/${tenant}/${locale}`;
  }, [tenant, locale]);

  const showSuccess = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.LOW,
      actionUrl,
      actionLabel,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      actionUrl,
      actionLabel,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      actionUrl,
      actionLabel,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      actionUrl,
      actionLabel,
    });
  }, [showNotification]);

  const showSystemNotification = useCallback((title: string, message: string, priority: NotificationPriority = NotificationPriority.MEDIUM) => {
    return showNotification({
      title,
      message,
      type: NotificationType.SYSTEM,
      priority,
    });
  }, [showNotification]);

  const showOrderNotification = useCallback((title: string, message: string, orderId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.ORDER,
      priority: NotificationPriority.MEDIUM,
      actionUrl: orderId ? `${getBaseUrl()}/dashboard/ordenes-de-compra/ordenes-de-compra/${orderId}` : undefined,
      actionLabel: orderId ? 'Ver Orden' : undefined,
      metadata: { orderId },
    });
  }, [showNotification, getBaseUrl]);

  const showInventoryNotification = useCallback((title: string, message: string, productId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.INVENTORY,
      priority: NotificationPriority.HIGH,
      actionUrl: productId ? `${getBaseUrl()}/dashboard/inventarios` : undefined,
      actionLabel: productId ? 'Ver Inventario' : undefined,
      metadata: { productId },
    });
  }, [showNotification, getBaseUrl]);

  const showSaleNotification = useCallback((title: string, message: string, saleId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.SALE,
      priority: NotificationPriority.MEDIUM,
      actionUrl: saleId ? `${getBaseUrl()}/dashboard/ventas/ventas/${saleId}` : undefined,
      actionLabel: saleId ? 'Ver Venta' : undefined,
      metadata: { saleId },
    });
  }, [showNotification, getBaseUrl]);

  const showQuotationNotification = useCallback((title: string, message: string, quotationId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.QUOTATION,
      priority: NotificationPriority.MEDIUM,
      actionUrl: quotationId ? `${getBaseUrl()}/dashboard/cotizaciones/${quotationId}` : undefined,
      actionLabel: quotationId ? 'Ver Cotización' : undefined,
      metadata: { quotationId },
    });
  }, [showNotification, getBaseUrl]);

  const showInvoiceNotification = useCallback((title: string, message: string, invoiceId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.INVOICE,
      priority: NotificationPriority.HIGH,
      actionUrl: invoiceId ? `${getBaseUrl()}/dashboard/facturas/facturas/${invoiceId}` : undefined,
      actionLabel: invoiceId ? 'Ver Factura' : undefined,
      metadata: { invoiceId },
    });
  }, [showNotification, getBaseUrl]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSystemNotification,
    showOrderNotification,
    showInventoryNotification,
    showSaleNotification,
    showQuotationNotification,
    showInvoiceNotification,
  };
};