'use client';

import { toastService } from './toast.service';

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
    status: boolean;
    created_at: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toastService.error(error);
        throw new Error(error.message);
      }

      const data: LoginResponse = await response.json();
      
      // Guardar el token y los datos del usuario en localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tokenExpires', data.expires_at);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // También guardar el token en una cookie para compatibilidad
      document.cookie = `token=${data.access_token}; path=/; expires=${new Date(data.expires_at).toUTCString()}; secure; samesite=strict`;
      
      toastService.success('¡Bienvenido!');
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuth();
      toastService.info('Sesión cerrada correctamente');
    }
  },

  getToken(): string | null {
    // Primero intentar obtener el token de localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token ha expirado
      const expiresAt = localStorage.getItem('tokenExpires');
      if (expiresAt && new Date(expiresAt) > new Date()) {
        return token;
      } else {
        // Si el token ha expirado, limpiar todo
        this.logout();
        return null;
      }
    }
    
    // Si no hay token en localStorage, intentar con cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    const expiresAt = localStorage.getItem('tokenExpires');
    if (!expiresAt) return false;

    return new Date(expiresAt) > new Date();
  },

  async getCurrentUser(): Promise<LoginResponse['user'] | null> {
    // Primero intentar obtener el usuario de localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    // Si no hay usuario en localStorage, intentar obtenerlo de la API
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el usuario');
      }

      const user = await response.json();
      // Guardar el usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpires', new Date(Date.now() + 3600000).toUTCString());
  },

  setUser(user: LoginResponse['user']): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');
  },
}; 