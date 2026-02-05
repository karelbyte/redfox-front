import { useCallback } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationType, NotificationPriority, CreateNotificationDto } from '@/types/notification';
import { notificationService } from '@/services/notifications.service';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();

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
      actionUrl: orderId ? `/dashboard/ordenes-de-compra/${orderId}` : undefined,
      actionLabel: orderId ? 'Ver Orden' : undefined,
      metadata: { orderId },
    });
  }, [showNotification]);

  const showInventoryNotification = useCallback((title: string, message: string, productId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.INVENTORY,
      priority: NotificationPriority.HIGH,
      actionUrl: productId ? `/dashboard/inventarios` : undefined,
      actionLabel: productId ? 'Ver Inventario' : undefined,
      metadata: { productId },
    });
  }, [showNotification]);

  const showSaleNotification = useCallback((title: string, message: string, saleId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.SALE,
      priority: NotificationPriority.MEDIUM,
      actionUrl: saleId ? `/dashboard/ventas/${saleId}` : undefined,
      actionLabel: saleId ? 'Ver Venta' : undefined,
      metadata: { saleId },
    });
  }, [showNotification]);

  const showQuotationNotification = useCallback((title: string, message: string, quotationId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.QUOTATION,
      priority: NotificationPriority.MEDIUM,
      actionUrl: quotationId ? `/dashboard/cotizaciones/${quotationId}` : undefined,
      actionLabel: quotationId ? 'Ver Cotización' : undefined,
      metadata: { quotationId },
    });
  }, [showNotification]);

  const showInvoiceNotification = useCallback((title: string, message: string, invoiceId?: string) => {
    return showNotification({
      title,
      message,
      type: NotificationType.INVOICE,
      priority: NotificationPriority.HIGH,
      actionUrl: invoiceId ? `/dashboard/facturas/${invoiceId}` : undefined,
      actionLabel: invoiceId ? 'Ver Factura' : undefined,
      metadata: { invoiceId },
    });
  }, [showNotification]);

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