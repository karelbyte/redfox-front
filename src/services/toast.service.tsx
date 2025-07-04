import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

const toastOptions = {
  duration: 4000,
  position: 'top-right' as const,
};

// Componente de toast que se adapta al tema
const ThemedToast = ({ t, message, type }: { 
  t: Toast; 
  message: string; 
  type: 'success' | 'error' | 'warning' | 'info' 
}) => {
  const { currentTheme } = useTheme();

  // Colores base para cada tipo de toast
  const baseColors = {
    success: {
      bg: 'rgb(240, 253, 244)',
      text: 'rgb(22, 101, 52)',
      border: 'rgb(187, 247, 208)',
      icon: 'rgb(34, 197, 94)',
    },
    error: {
      bg: 'rgb(254, 242, 242)',
      text: 'rgb(153, 27, 27)',
      border: 'rgb(254, 202, 202)',
      icon: 'rgb(239, 68, 68)',
    },
    warning: {
      bg: 'rgb(255, 251, 235)',
      text: 'rgb(146, 64, 14)',
      border: 'rgb(254, 243, 199)',
      icon: 'rgb(245, 158, 11)',
    },
    info: {
      bg: 'rgb(239, 246, 255)',
      text: 'rgb(30, 64, 175)',
      border: 'rgb(191, 219, 254)',
      icon: 'rgb(59, 130, 246)',
    },
  };

  // Colores del tema actual
  const themeColors = {
    red: {
      primary: 'rgb(255, 92, 92)',
      light: 'rgb(255, 245, 245)',
      dark: 'rgb(230, 26, 26)',
    },
    blue: {
      primary: 'rgb(59, 130, 246)',
      light: 'rgb(239, 246, 255)',
      dark: 'rgb(29, 78, 216)',
    },
    gray: {
      primary: 'rgb(107, 114, 128)',
      light: 'rgb(249, 250, 251)',
      dark: 'rgb(55, 65, 81)',
    },
    'green-gray': {
      primary: 'rgb(107, 124, 107)',
      light: 'rgb(246, 248, 246)',
      dark: 'rgb(70, 84, 70)',
    },
    brown: {
      primary: 'rgb(89, 52, 19)',
      light: 'rgb(250, 248, 246)',
      dark: 'rgb(59, 35, 13)',
    },
  };

  const currentThemeColors = themeColors[currentTheme];
  const baseColor = baseColors[type];

  // Adaptar colores según el tema para success e info
  const getAdaptedColors = () => {
    if (type === 'success') {
      return {
        bg: currentThemeColors.light,
        text: currentThemeColors.dark,
        border: `rgba(${currentThemeColors.primary.replace('rgb(', '').replace(')', '')}, 0.2)`,
        icon: currentThemeColors.primary,
      };
    }
    if (type === 'info') {
      return {
        bg: currentThemeColors.light,
        text: currentThemeColors.dark,
        border: `rgba(${currentThemeColors.primary.replace('rgb(', '').replace(')', '')}, 0.2)`,
        icon: currentThemeColors.primary,
      };
    }
    return baseColor;
  };

  const colors = getAdaptedColors();

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 backdrop-blur-sm`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        animation: t.visible ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-in',
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.icon }}
            >
              {type === 'success' && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {type === 'error' && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {type === 'warning' && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {type === 'info' && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p 
              className="text-sm font-medium"
              style={{ color: colors.text }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l" style={{ borderColor: colors.border }}>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
          style={{
            color: colors.text,
            '--tw-ring-color': colors.icon,
            '--tw-ring-offset-color': colors.bg,
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${colors.icon.replace('rgb(', '').replace(')', '')}, 0.1)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Wrapper para usar el contexto del tema
const ThemedToastWrapper = ({ t, message, type }: { 
  t: Toast; 
  message: string; 
  type: 'success' | 'error' | 'warning' | 'info' 
}) => {
  return <ThemedToast t={t} message={message} type={type} />;
};

export const toastService = {
  success: (message: string) => {
    toast.custom((t) => <ThemedToastWrapper t={t} message={message} type="success" />, toastOptions);
  },

  error: (error: ErrorResponse | string) => {
    const message = typeof error === 'string' ? error : error.message;
    toast.custom((t) => <ThemedToastWrapper t={t} message={message} type="error" />, toastOptions);
  },

  warning: (message: string) => {
    toast.custom((t) => <ThemedToastWrapper t={t} message={message} type="warning" />, toastOptions);
  },

  info: (message: string) => {
    toast.custom((t) => <ThemedToastWrapper t={t} message={message} type="info" />, toastOptions);
  },
}; 