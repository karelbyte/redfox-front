import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Componente que renderiza contenido condicionalmente basado en permisos del usuario
 * @param permissions - Array de códigos de permisos requeridos
 * @param children - Contenido a renderizar si el usuario tiene permisos
 * @param fallback - Contenido alternativo si el usuario no tiene permisos (opcional)
 * @param requireAll - Si es true, requiere todos los permisos; si es false, requiere al menos uno
 */
export function PermissionGuard({ 
  permissions, 
  children, 
  fallback = null, 
  requireAll = false 
}: PermissionGuardProps) {
  const { can, canAll } = usePermissions();
  
  const hasPermission = requireAll ? canAll(permissions) : can(permissions);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook personalizado para usar con renderizado condicional
 * @param permissions - Array de códigos de permisos a verificar
 * @param requireAll - Si es true, requiere todos los permisos; si es false, requiere al menos uno
 * @returns true si el usuario tiene los permisos requeridos
 */
export function usePermissionGuard(permissions: string[], requireAll = false) {
  const { can, canAll } = usePermissions();
  return requireAll ? canAll(permissions) : can(permissions);
} 