import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { Employee } from '@/types/employee';

export const employeesService = {
  getEmployees: async (
    page: number = 1,
    term?: string,
    isActive?: boolean,
    limit: number = 10
  ): Promise<PaginatedResponse<Employee>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }
    
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    return await api.get(`/employees?${params.toString()}`);
  },

  getEmployee: async (id: string): Promise<Employee> => {
    return await api.get(`/employees/${id}`);
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    return await api.post('/employees', data);
  },

  updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    return await api.put(`/employees/${id}`, data);
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  toggleActive: async (id: string): Promise<Employee> => {
    return await api.put(`/employees/${id}/toggle-active`, {});
  },
};
