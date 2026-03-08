'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface User {
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
  organization_id?: string;
  organization_slug?: string;
  status: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Verificar si hay un token válido antes de intentar obtener el usuario
          if (authService.isAuthenticated()) {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } else {
            // Si no hay token válido, limpiar el estado
            authService.clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // En caso de error, limpiar el estado de autenticación
        if (typeof window !== 'undefined') {
          authService.clearAuth();
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      initAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?.organization_slug) {
        // Guardar el tenant en una cookie para el middleware
        document.cookie = `last_tenant=${currentUser.organization_slug}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=strict`;
        router.push(`/${currentUser.organization_slug}/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      authService.logout();
      setUser(null);
      // Usar router.push sin locale - el middleware lo agregará automáticamente
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && !isLoading,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 