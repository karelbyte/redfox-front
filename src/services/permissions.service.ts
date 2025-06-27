import { api } from './api';
import { Permission, PermissionGroup } from '@/types/permission';

interface RolePermissionsResponse {
  permissions?: string[];
  data?: string[];
}

interface RolePermissionItem {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  deletedAt: string | null;
  role: {
    id: string;
    code: string;
    description: string;
  };
  permission: {
    id: string;
    code: string;
    description: string;
  };
}

class PermissionsService {
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<Permission[]>('/permissions');
    // Filtrar permisos eliminados
    return response.filter(permission => permission.deletedAt === null);
  }

  async getPermissionsGroupedByModule(): Promise<PermissionGroup[]> {
    const permissions = await this.getPermissions();
    
    // Agrupar permisos por módulo
    const groupedPermissions = permissions.reduce((groups: PermissionGroup[], permission) => {
      const existingGroup = groups.find(group => group.module === permission.module);
      
      if (existingGroup) {
        existingGroup.permissions.push(permission);
      } else {
        groups.push({
          module: permission.module,
          permissions: [permission]
        });
      }
      
      return groups;
    }, []);

    // Ordenar grupos por módulo y permisos por código
    return groupedPermissions
      .sort((a, b) => a.module.localeCompare(b.module))
      .map(group => ({
        ...group,
        permissions: group.permissions.sort((a, b) => a.code.localeCompare(b.code))
      }));
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const response = await api.get<RolePermissionsResponse | string[] | RolePermissionItem[]>(`/role-permissions/role/${roleId}`);
    
    // Manejar diferentes estructuras de respuesta
    if (Array.isArray(response)) {
      // Si es un array de objetos con permission.code (estructura real del backend)
      if (response.length > 0 && typeof response[0] === 'object' && 'permission' in response[0]) {
        return (response as RolePermissionItem[])
          .filter(item => item.deletedAt === null) // Filtrar elementos eliminados
          .map(item => item.permissionId); // Usar permissionId en lugar de permission.code
      }
      // Si es un array directo de strings
      return response as string[];
    } else if (response && Array.isArray(response.permissions)) {
      return response.permissions;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Estructura de respuesta inesperada:', response);
      return [];
    }
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    await api.put(`/role-permissions/role/${roleId}`, { permissionIds: permissions });
  }
}

export const permissionsService = new PermissionsService(); 