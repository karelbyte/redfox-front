import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { Payroll } from '@/types/employee';

export const payrollService = {
  getPayroll: async (
    page: number = 1,
    term?: string,
    limit: number = 10
  ): Promise<PaginatedResponse<Payroll>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }

    return await api.get<PaginatedResponse<Payroll>>(`/payroll?${params.toString()}`);
  },

  getPayrollRecord: async (id: string): Promise<Payroll> => {
    return await api.get<Payroll>(`/payroll/${id}`);
  },

  generatePayroll: async (data: any): Promise<Payroll> => {
    return await api.post<Payroll>('/payroll', data);
  },

  updatePayroll: async (id: string, data: Partial<Payroll>): Promise<Payroll> => {
    return await api.put<Payroll>(`/payroll/${id}`, data as any);
  },

  deletePayroll: async (id: string): Promise<void> => {
    await api.delete(`/payroll/${id}`);
  },
};
