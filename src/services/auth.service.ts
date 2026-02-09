'use client';

import { toastService } from './toast.service';

// Configuración de la API con valor por defecto
const API_BASE_URL = process.env.NEXT_PUBLIC_URL_API || 'https://nitrocore.fly.dev';
interface LoginResponse {
  access_token: string;
  expires_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: Array<{
      id: string;
      code: string;
      description: string;
      status: boolean;
      created_at: string;
    }>;
    permissions: string[];
    status: boolean;
    created_at: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toastService.error(error.message || 'Error al iniciar sesión');
        throw new Error(error.message);
      }

      const data: LoginResponse = await response.json();

      // Guardar el token y los datos del usuario en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('tokenExpires', data.expires_at);
        localStorage.setItem('user', JSON.stringify(data.user));

        // También guardar el token en una cookie para compatibilidad
        document.cookie = `token=${data.access_token}; path=/; expires=${new Date(data.expires_at).toUTCString()}; secure; samesite=strict`;
      }

    } catch (error) {
      if (error instanceof Error) {
        // El toast ya se mostró arriba si era error de respuesta
        if (!error.message) toastService.error(error.message);
      }
      throw error;
    }
  },

  async register(data: { name: string; email: string; password: string; password_confirmation: string }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toastService.error(error.message || 'Error en el registro');
        throw new Error(error.message);
      }

      // No login automatically, wait for activation
    } catch (error) {
      if (error instanceof Error) {
        // Toast handled above
      }
      throw error;
    }
  },

  async activate(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error user activation');
      }
    } catch (error) {
      throw error;
    }
  },

  logout(): void {
    this.clearAuth();

    if (typeof window !== 'undefined') {
      // Limpiar todas las cookies relacionadas con la autenticación
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name === 'token' || name.startsWith('auth_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict`;
        }
      });
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Primero intentar obtener el token de localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token ha expirado
      const expiresAt = localStorage.getItem('tokenExpires');
      if (expiresAt && new Date(expiresAt) > new Date()) {
        return token;
      } else {
        // Si el token ha expirado, limpiar todo
        this.clearAuth();
        return null;
      }
    }

    // Si no hay token en localStorage, intentar con cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      this.clearAuth();
      return null;
    }

    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    const expiresAt = localStorage.getItem('tokenExpires');
    if (!expiresAt) {
      this.clearAuth();
      return false;
    }

    const isExpired = new Date(expiresAt) <= new Date();
    if (isExpired) {
      this.clearAuth();
      return false;
    }

    return true;
  },

  async getCurrentUser(): Promise<LoginResponse['user'] | null> {
    if (typeof window === 'undefined') return null;

    // Verificar si hay un token válido
    if (!this.isAuthenticated()) {
      this.clearAuth();
      return null;
    }

    // Primero intentar obtener el usuario de localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Verificar que el usuario tenga los campos mínimos requeridos
        if (user && user.id && user.email) {
          return user;
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Si no hay usuario válido en localStorage, intentar obtenerlo de la API
    const token = this.getToken();
    if (!token) {
      this.clearAuth();
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido, limpiar autenticación
          this.clearAuth();
        }
        throw new Error('Error al obtener el usuario');
      }

      const user = await response.json();
      // Guardar el usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      // En caso de error, limpiar la autenticación
      this.clearAuth();
      return null;
    }
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpires', new Date(Date.now() + 3600000).toUTCString());
    }
  },

  setUser(user: LoginResponse['user']): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpires');
      localStorage.removeItem('user');

      // Limpiar cookies relacionadas con la autenticación
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name === 'token' || name.startsWith('auth_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict`;
        }
      });
    }
  },
}; 