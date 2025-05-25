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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
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
      
      // Guardar el token en una cookie
      document.cookie = `token=${data.access_token}; path=/; expires=${new Date(data.expires_at).toUTCString()}; secure; samesite=strict`;
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Eliminar la cookie del token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
  },

  getToken(): string | null {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async getCurrentUser(): Promise<LoginResponse['user'] | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el usuario actual');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },
}; 