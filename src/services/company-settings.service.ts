import { api } from './api';
import { CompanySettings, UpdateCompanySettingsData } from '@/types/company-settings';

const baseURL = (process.env.NEXT_PUBLIC_URL_API || 'https://nitro-api-app-production.up.railway.app') + '/api';

export const companySettingsService = {
  async get(): Promise<CompanySettings> {
    return api.get<CompanySettings>('/company-settings');
  },

  async update(data: UpdateCompanySettingsData): Promise<CompanySettings> {
    return api.put<CompanySettings>('/company-settings', data as unknown as Record<string, unknown>);
  },

  async uploadLogo(file: File): Promise<CompanySettings> {
    const formData = new FormData();
    formData.append('logo', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${baseURL}/company-settings/logo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpires');
        localStorage.removeItem('user');
        const pathname = window.location.pathname;
        const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
        const locale = localeMatch ? localeMatch[1] : 'es';
        window.location.href = `/${locale}/login`;
      }
      return Promise.reject(new Error('Sesión expirada'));
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return Promise.reject(new Error(errorData.message || 'Error al subir el logo'));
      } catch {
        return Promise.reject(new Error('Error al subir el logo'));
      }
    }

    return response.json();
  },
};
