import { api } from './api';
import { Tax } from '@/types/tax';

interface PaginatedResponse {
  data: Tax[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class TaxesService {
  async getTaxes(page?: number, term?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/taxes${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse>(url);
    return response;
  }

  async createTax(data: Omit<Tax, 'id' | 'created_at' | 'updated_at'>): Promise<Tax> {
    const response = await api.post<Tax>('/taxes', data);
    return response;
  }

  async updateTax(id: string, data: Partial<Tax>): Promise<Tax> {
    const response = await api.put<Tax>(`/taxes/${id}`, data);
    return response;
  }

  async deleteTax(id: string): Promise<void> {
    await api.delete(`/taxes/${id}`);
  }
}

export const taxesService = new TaxesService(); 