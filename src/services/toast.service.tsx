import React from 'react';
import toast, { Toast } from 'react-hot-toast';

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

const toastOptions = {
  duration: 3000,
  position: 'top-right' as const,
};

const renderToast = (t: Toast, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: 'ℹ️',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full ${style.bg} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-xl">{style.icon}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${style.text}`}>
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const toastService = {
  success: (message: string) => {
    toast.custom((t) => renderToast(t, message, 'success'), toastOptions);
  },

  error: (error: ErrorResponse | string) => {
    const message = typeof error === 'string' ? error : error.message;
    toast.custom((t) => renderToast(t, message, 'error'), toastOptions);
  },

  warning: (message: string) => {
    toast.custom((t) => renderToast(t, message, 'warning'), toastOptions);
  },

  info: (message: string) => {
    toast.custom((t) => renderToast(t, message, 'info'), toastOptions);
  },
}; 