import { api } from './api';
import { Currency } from '@/types/currency';

interface PaginatedResponse {
  data: Currency[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class CurrenciesService {
  async getCurrencies(page: number = 1, term?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/currencies${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse>(url);
    return response;
  }

  async createCurrency(data: Omit<Currency, 'id'>): Promise<Currency> {
    const response = await api.post<Currency>('/currencies', data);
    return response;
  }

  async updateCurrency(id: string, data: Partial<Currency>): Promise<Currency> {
    const response = await api.put<Currency>(`/currencies/${id}`, data);
    return response;
  }

  async deleteCurrency(id: string): Promise<void> {
    await api.delete(`/currencies/${id}`);
  }
}

export const currenciesService = new CurrenciesService(); 