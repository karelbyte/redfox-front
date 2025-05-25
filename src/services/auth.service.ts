'use client';

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

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data: LoginResponse = await response.json();
      
      // Guardar el token y los datos del usuario en localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tokenExpires', data.expires_at);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // También guardar el token en una cookie para compatibilidad
      document.cookie = `token=${data.access_token}; path=/; expires=${new Date(data.expires_at).toUTCString()}; secure; samesite=strict`;
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Eliminar datos de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');
    
    // Eliminar la cookie del token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
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
}; 