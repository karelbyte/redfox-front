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
  organization_referrer_code?: string;
  /** País de la organización en ISO 3166-1 alpha-2. */
  organization_country?: string;
  /** Moneda del país de la organización, en ISO 4217. */
  organization_currency?: string;
  status: boolean;
  admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, userData?: any) => Promise<void>;
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
          if (authService.isAuthenticated()) {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } else {
            authService.clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithToken = async (token: string, userData?: any) => {
    try {
      console.log('[AuthContext] loginWithToken iniciado');
      setIsLoading(true);
      
      if (typeof window !== "undefined") {
        console.log('[AuthContext] Guardando token en localStorage y cookies');
        localStorage.setItem("token", token);
        const expiresAtDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
        const expiresAt = expiresAtDate.toUTCString();
        localStorage.setItem("tokenExpires", expiresAt);
        
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `token=${token}; path=/; expires=${expiresAt}; ${isSecure ? 'secure;' : ''} samesite=strict`;
        
        if (userData) {
          console.log('[AuthContext] Usando datos de usuario proporcionados:', userData.email);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.log('[AuthContext] Limpiando usuario previo para recarga');
          localStorage.removeItem("user");
        }
      }

      let currentUser = userData;
      if (!currentUser) {
        console.log('[AuthContext] No hay userData, intentando obtener desde la API (fallback)...');
        currentUser = await authService.getCurrentUser();
      }
      
      if (!currentUser) {
        console.error('[AuthContext] Error: El usuario no está en la petición y tampoco se pudo recuperar');
        throw new Error('No se pudo identificar al usuario');
      }

      console.log('[AuthContext] Login exitoso para:', currentUser.email);
      setUser(currentUser);

      if (currentUser?.organization_slug) {
        document.cookie = `last_tenant=${currentUser.organization_slug}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=strict`;
        router.push(`/${currentUser.organization_slug}/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (error) {
      console.error("[AuthContext] Error fatal en loginWithToken:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?.organization_slug) {
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
    loginWithToken,
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
