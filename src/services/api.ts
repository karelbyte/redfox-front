const baseURL = process.env.NEXT_PUBLIC_URL_API + '/api' || 'http://localhost:3000/api';

const getHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    const response = await fetch(`${baseURL}${url}${queryString}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error en la petición');
    }

    return response.json();
  },

  post: async <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body,
    });

    if (!response.ok) {
      throw new Error('Error en la petición');
    }

    return response.json();
  },

  put: async <T>(url: string, data: Record<string, unknown> | FormData): Promise<T> => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    const response = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body,
    });

    if (!response.ok) {
      throw new Error('Error en la petición');
    }

    return response.json();
  },

  delete: async (url: string): Promise<void> => {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error en la petición');
    }
  },
}; 