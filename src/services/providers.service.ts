import { api } from "./api";
import { Provider, ProvidersResponse } from "@/types/provider";

export const providersService = {
  getProviders: async (page: number = 1): Promise<ProvidersResponse> => {
    return api.get<ProvidersResponse>("/providers", { page });
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