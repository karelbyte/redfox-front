import { API_BASE_URL } from '@/lib/config';

const baseURL = API_BASE_URL + '/api';
console.log("DEBUG API URL:", API_BASE_URL);
const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');

    // Obtener tenant y locale de la URL de forma robusta
    const segments = window.location.pathname.split('/').filter(Boolean);
    const locales = ['es', 'en'];

    // El tenant suele ser el primer segmento si no es un locale
    const firstSegmentIsLocale = locales.includes(segments[0]);
    const tenant = firstSegmentIsLocale ? null : segments[0];
    const locale = firstSegmentIsLocale ? segments[0] : (segments[1] || 'es');

    if (tenant) {
      window.location.href = `/${tenant}/${locale}/login`;
    } else {
      window.location.href = `/${locale}/login`;
    }
  }
};

const getHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

    // Obtener el tenant y locale actual de la URL
    const segments = window.location.pathname.split('/').filter(Boolean);
    const locales = ['es', 'en'];
    const firstIsLocale = locales.includes(segments[0]);
    const tenant = firstIsLocale ? null : segments[0];
    const locale = firstIsLocale ? segments[0] : (segments[1] || 'es');

    if (tenant) {
      headers['X-Tenant-Slug'] = tenant;
    }
    // Enviar el idioma activo para que la API responda en el idioma correcto
    headers['X-Locale'] = locale;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Sesión expirada'));
  }

  if (!response.ok) {
    try {
      const errorData = await response.json();
      // Si message es un array, unirlo con saltos de línea
      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join('\n')
        : errorData.message || 'Error en la petición';
      return Promise.reject(new Error(errorMessage));
    } catch {
      return Promise.reject(new Error('Error en la petición'));
    }
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return Promise.reject(new Error('Error al procesar la respuesta'));
  }
};

export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
      const response = await fetch(`${baseURL}${url}${queryString}`, {
        headers: getHeaders(),
      });

      return handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },

  post: async <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${baseURL}${url}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body,
      });

      return handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },

  put: async <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${baseURL}${url}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body,
      });

      return handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },

  patch: async <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${baseURL}${url}`, {
        method: 'PATCH',
        headers: getHeaders(isFormData),
        body,
      });

      return handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },

  delete: async (url: string, body?: Record<string, unknown>): Promise<void> => {
    try {
      const response = await fetch(`${baseURL}${url}`, {
        method: 'DELETE',
        headers: getHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return Promise.reject(new Error('Sesión expirada'));
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          return Promise.reject(new Error(errorData.message || 'Error en la petición'));
        } catch {
          return Promise.reject(new Error('Error en la petición'));
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },
}; 