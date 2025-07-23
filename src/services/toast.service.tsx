import toast from 'react-hot-toast';

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

const toastOptions = {
  duration: 3000,
  position: 'top-right' as const,
};

export const toastService = {
  success: (message: string) => {
    const toastId = `success-${Date.now()}-${Math.random()}`;
    toast.success(message, {
      ...toastOptions,
      id: toastId,
    });
  },

  error: (error: ErrorResponse | string) => {
    const message = typeof error === 'string' ? error : error.message;
    const toastId = `error-${Date.now()}-${Math.random()}`;
    toast.error(message, {
      ...toastOptions,
      id: toastId,
    });
  },

  warning: (message: string) => {
    const toastId = `warning-${Date.now()}-${Math.random()}`;
    toast(message, {
      ...toastOptions,
      id: toastId,
      icon: '⚠️',
    });
  },

  info: (message: string) => {
    const toastId = `info-${Date.now()}-${Math.random()}`;
    toast(message, {
      ...toastOptions,
      id: toastId,
      icon: 'ℹ️',
    });
  },
}; 