import { useAuth } from '@/context/AuthContext';

/**
 * Hook personalizado para verificar permisos del usuario autenticado
 * @returns Objeto con método "can" para verificar permisos
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param permissions - Array de códigos de permisos a verificar
   * @returns true si el usuario tiene al menos uno de los permisos, false en caso contrario
   */
  const can = (permissions: string[]): boolean => {
    // Si no está autenticado, no tiene permisos
    if (!isAuthenticated || !user) {
      return false;
    }

    // Si no hay permisos especificados, no tiene permisos
    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Si "all" está en los permisos, retornar true inmediatamente
    if (permissions.includes("all")) {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos especificados
    return permissions.some(permission => 
      user.permissions.includes(permission)
    );
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permissions - Array de códigos de permisos a verificar
   * @returns true si el usuario tiene todos los permisos, false en caso contrario
   */
  const canAll = (permissions: string[]): boolean => {
    // Si no está autenticado, no tiene permisos
    if (!isAuthenticated || !user) {
      return false;
    }

    // Si no hay permisos especificados, no tiene permisos
    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Si "all" está en los permisos, retornar true inmediatamente
    if (permissions.includes("all")) {
      return true;
    }

    // Verificar si el usuario tiene todos los permisos especificados
    return permissions.every(permission => 
      user.permissions.includes(permission)
    );
  };

  /**
   * Obtiene todos los permisos del usuario autenticado
   * @returns Array de códigos de permisos del usuario
   */
  const getUserPermissions = (): string[] => {
    if (!isAuthenticated || !user) {
      return [];
    }
    return user.permissions;
  };

  return {
    can,
    canAll,
    getUserPermissions,
    isAuthenticated,
  };
} 