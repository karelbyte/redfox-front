import { ApiResponse } from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_URL_API + '/api' || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public error: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getErrorMessage = (message: string | string[]): string => {
  if (Array.isArray(message)) {
    return message[0] || 'Error en la petición';
  }
  return message || 'Error en la petición';
};

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(data.message),
        data.statusCode || response.status,
        data.error || 'Error desconocido'
      );
    }

    return data;
  },

  async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(responseData.message),
        responseData.statusCode || response.status,
        responseData.error || 'Error desconocido'
      );
    }

    return responseData;
  },

  async put<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(responseData.message),
        responseData.statusCode || response.status,
        responseData.error || 'Error desconocido'
      );
    }

    return responseData;
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        getErrorMessage(data.message),
        data.statusCode || response.status,
        data.error || 'Error desconocido'
      );
    }
  },
}; 