import toast from 'react-hot-toast';

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export const toastService = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
    });
  },

  error: (error: ErrorResponse | string) => {
    const message = typeof error === 'string' ? error : error.message;
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fef3c7',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #dbeafe',
      },
    });
  },
}; 