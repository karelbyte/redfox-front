export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

export interface RolePermissions {
  roleId: string;
  permissions: string[]; // Array de IDs de permisos
} 