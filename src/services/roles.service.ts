import { api } from './api';
import { Role, RoleFormData, RoleResponse } from '@/types/role';

export const rolesService = {
  async getRoles(page: number = 1): Promise<RoleResponse> {
    const response = await api.get<RoleResponse>('/roles', { page });
    return response;
  },

  async getRole(id: string): Promise<Role> {
    const response = await api.get<Role>(`/roles/${id}`);
    return response;
  },

  async createRole(roleData: RoleFormData): Promise<Role> {
    const response = await api.post<Role>('/roles', roleData);
    return response;
  },

  async updateRole(id: string, roleData: RoleFormData): Promise<Role> {
    const response = await api.put<Role>(`/roles/${id}`, roleData);
    return response;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }
}; 