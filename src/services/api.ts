import { API_BASE_URL } from '@/lib/config';

const baseURL = API_BASE_URL + '/api';

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');

    // Obtener tenant y locale de la URL de forma robusta
    const segments = window.location.pathname.split('/').filter(Boolean);
    const locales = ['es', 'en', 'zh'];

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
    const locales = ['es', 'en', 'zh'];
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

const handleResponse = async (response: Response, responseType?: string) => {
  if (response.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Sesión expirada'));
  }

  if (!response.ok) {
    try {
      const errorData = await response.json();
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

  // Si se solicita un blob, retornar los datos binarios directamente
  if (responseType === 'blob') {
    return response.blob();
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Si no es JSON pero tampoco se pidió un blob, intentar retornar texto o null
    try {
      return await response.text();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return Promise.reject(new Error('Error al procesar la respuesta'));
  }
};

/**
 * Helper para construir URLs con parámetros de consulta de forma segura
 */
const buildUrl = (url: string, params?: Record<string, unknown>) => {
  if (!params) return `${baseURL}${url}`;
  
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  if (!queryString) return `${baseURL}${url}`;

  const separator = url.includes('?') ? '&' : '?';
  return `${baseURL}${url}${separator}${queryString}`;
};

export const api = {
  get: async <T>(url: string, options?: Record<string, unknown>): Promise<T> => {
    try {
      // Extraer responseType si existe para pasarlo al manejador
      const responseType = options?.responseType as string | undefined;
      // Eliminar responseType de los parámetros de consulta si no queremos que se envíe al backend
      const queryParams = { ...options };
      delete queryParams.responseType;

      const fullUrl = buildUrl(url, queryParams);
      const response = await fetch(fullUrl, {
        headers: getHeaders(),
      });

      return handleResponse(response, responseType);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
      }
      throw error;
    }
  },

  post: async <T>(url: string, data: Record<string, unknown> | FormData, options?: { responseType?: string }): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${baseURL}${url}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body,
      });

      return handleResponse(response, options?.responseType);
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
