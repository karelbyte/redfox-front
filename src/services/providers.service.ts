import { api } from "./api";
import { Provider, ProvidersResponse } from "@/types/provider";

interface GetProvidersParams {
  page?: number;
  term?: string;
}

export const providersService = {
  getProviders: async (page: number = 1, term?: string): Promise<ProvidersResponse> => {
    const params: GetProvidersParams = { page };
    if (term && term.trim()) {
      params.term = term.trim();
    }
    
    return api.get<ProvidersResponse>("/providers", params);
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
}; 