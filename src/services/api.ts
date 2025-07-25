const baseURL = (process.env.NEXT_PUBLIC_URL_API || 'https://nitro-api-app-production.up.railway.app') + '/api';
//const baseURL = 'https://nitro-api-app-production-4b41.up.railway.app/api';
const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');
    
    // Obtener el locale actual de la URL
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'es';
    
    // Usar window.location.href con el locale correcto
    window.location.href = `/${locale}/login`;
  }
};

const getHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {};
  
  if (typeof window !== 'undefined') {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
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
      return Promise.reject(new Error(errorData.message || 'Error en la petición'));
    } catch {
      return Promise.reject(new Error('Error en la petición'));
    }
  }

  try {
    return await response.json();
  } catch  {
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

  delete: async (url: string): Promise<void> => {
    try {
      const response = await fetch(`${baseURL}${url}`, {
        method: 'DELETE',
        headers: getHeaders(),
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