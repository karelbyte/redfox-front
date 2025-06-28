import { api } from './api';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest, UserWithPermissionDescriptions } from '@/types/user';

class UsersService {
  async getUsers(page: number = 1, limit: number = 10, term?: string): Promise<UserResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<UserResponse>(url);
  }

  async getUser(id: string): Promise<User> {
    return await api.get<User>(`/users/${id}`);
  }

  async getUserWithPermissionDescriptions(id: string): Promise<UserWithPermissionDescriptions> {
    return await api.get<UserWithPermissionDescriptions>(`/users/${id}/with-permission-descriptions`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return await api.post<User>('/users', userData as unknown as Record<string, unknown>);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return await api.put<User>(`/users/${id}`, userData as unknown as Record<string, unknown>);
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

export const usersService = new UsersService(); 