import { api } from "./api";
import { Provider, ProvidersResponse } from "@/types/provider";

export const providersService = {
  getProviders: async (page?: number, term?: string): Promise<ProvidersResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);

    const queryString = params.toString();
    const url = `/providers${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ProvidersResponse>(url);
    return response;
  },

  createProvider: async (provider: Omit<Provider, "id" | "created_at">): Promise<Provider> => {
    return api.post<Provider>("/providers", provider);
  },

  updateProvider: async (id: string, provider: Partial<Provider>): Promise<Provider> => {
    return api.put<Provider>(`/providers/${id}`, provider);
  },

  deleteProvider: async (id: string): Promise<void> => {
    return api.delete(`/providers/${id}`);
  },

  deleteProviders: async (ids: string[]): Promise<void> => {
    return api.post('/providers/bulk-delete', { ids });
  },
};