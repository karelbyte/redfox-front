/**
 * Configuración centralizada de la aplicación
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_URL_API || 'https://nitrocore.up.railway.app-off';

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const APP_CONFIG = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment: IS_DEVELOPMENT,
  projectName: 'Nitro',
  defaultLocale: 'es',
};
