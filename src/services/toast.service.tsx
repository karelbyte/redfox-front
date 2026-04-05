import toast from 'react-hot-toast';
import { NotificationType, NotificationPriority } from '@/types/notification';
import { useToastNotificationStore } from '@/stores/toast-notification.store';

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

interface ToastOptions {
  /** Si false, el toast NO se agrega a la campana de notificaciones. Default: true */
  notify?: boolean;
}

const toastOptions = {
  duration: 3000,
  position: 'top-right' as const,
};

function pushToStore(
  message: string,
  type: NotificationType,
  priority: NotificationPriority,
  notify: boolean,
) {
  if (!notify) return;
  useToastNotificationStore.getState().push({
    id: `toast-${Date.now()}-${Math.random()}`,
    title: typeToTitle(type),
    message,
    type,
    priority,
  });
}

function typeToTitle(type: NotificationType): string {
  switch (type) {
    case NotificationType.SUCCESS: return '✓ Operación exitosa';
    case NotificationType.ERROR:   return '✗ Error';
    case NotificationType.WARNING: return '⚠ Advertencia';
    default:                       return 'ℹ Información';
  }
}

export const toastService = {
  success: (message: string, options: ToastOptions = {}) => {
    const { notify = true } = options;
    const toastId = `success-${Date.now()}-${Math.random()}`;
    toast.success(message, { ...toastOptions, id: toastId });
    pushToStore(message, NotificationType.SUCCESS, NotificationPriority.LOW, notify);
  },

  error: (error: ErrorResponse | string, options: ToastOptions = {}) => {
    const { notify = true } = options;
    const message = typeof error === 'string' ? error : error.message;
    const toastId = `error-${Date.now()}-${Math.random()}`;
    toast.error(message, { ...toastOptions, id: toastId });
    pushToStore(message, NotificationType.ERROR, NotificationPriority.HIGH, notify);
  },

  warning: (message: string, options: ToastOptions = {}) => {
    const { notify = true } = options;
    const toastId = `warning-${Date.now()}-${Math.random()}`;
    toast(message, { ...toastOptions, id: toastId, icon: '⚠️' });
    pushToStore(message, NotificationType.WARNING, NotificationPriority.MEDIUM, notify);
  },

  info: (message: string, options: ToastOptions = {}) => {
    // info no va al bell por defecto — son mensajes triviales
    const { notify = false } = options;
    const toastId = `info-${Date.now()}-${Math.random()}`;
    toast(message, { ...toastOptions, id: toastId, icon: 'ℹ️' });
    pushToStore(message, NotificationType.INFO, NotificationPriority.LOW, notify);
  },
};
