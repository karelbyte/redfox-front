import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { Department } from '@/types/employee';

export const departmentsService = {
  getDepartments: async (
    page: number = 1,
    term?: string,
    limit: number = 10
  ): Promise<PaginatedResponse<Department>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }

    return await api.get<PaginatedResponse<Department>>(`/departments?${params.toString()}`);
  },

  getDepartment: async (id: string): Promise<Department> => {
    return await api.get<Department>(`/departments/${id}`);
  },

  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    return await api.post<Department>('/departments', data as any);
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    return await api.put<Department>(`/departments/${id}`, data as any);
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};
