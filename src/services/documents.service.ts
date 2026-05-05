import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { EmployeeDocument } from '@/types/employee';

const buildFormData = (data: Partial<EmployeeDocument>, file?: File | null): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  if (file) formData.append('file', file);
  return formData;
};

export const documentsService = {
  getDocuments: async (
    page: number = 1,
    term?: string,
    limit: number = 10,
  ): Promise<PaginatedResponse<EmployeeDocument>> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (term) params.append('term', term);
    return await api.get<PaginatedResponse<EmployeeDocument>>(`/employee-documents?${params.toString()}`);
  },

  getDocument: async (id: string): Promise<EmployeeDocument> => {
    return await api.get<EmployeeDocument>(`/employee-documents/${id}`);
  },

  createDocument: async (data: Partial<EmployeeDocument>, file?: File | null): Promise<EmployeeDocument> => {
    return await api.post<EmployeeDocument>('/employee-documents', buildFormData(data, file));
  },

  updateDocument: async (id: string, data: Partial<EmployeeDocument>, file?: File | null): Promise<EmployeeDocument> => {
    return await api.put<EmployeeDocument>(`/employee-documents/${id}`, buildFormData(data, file));
  },

  verifyDocument: async (id: string): Promise<EmployeeDocument> => {
    return await api.put<EmployeeDocument>(`/employee-documents/${id}/verify`, {});
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/employee-documents/${id}`);
  },
};
