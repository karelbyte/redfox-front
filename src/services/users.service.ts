import { api } from './api';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';

class UsersService {
  async getUsers(page: number = 1, limit: number = 10): Promise<UserResponse> {
    return await api.get<UserResponse>(`/users?page=${page}&limit=${limit}`);
  }

  async getUser(id: string): Promise<User> {
    return await api.get<User>(`/users/${id}`);
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