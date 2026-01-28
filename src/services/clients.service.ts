import { api } from "./api";
import { Client, ClientsResponse, ClientWithPackStatus } from "@/types/client";

export const clientsService = {
  getClients: async (page?: number, term?: string): Promise<ClientsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/clients${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ClientsResponse>(url);
    return response;
  },

  createClient: async (client: Partial<Client>): Promise<ClientWithPackStatus> => {
    return api.post<ClientWithPackStatus>("/clients", client);
  },

  updateClient: async (id: string, client: Partial<Client>): Promise<ClientWithPackStatus> => {
    return api.put<ClientWithPackStatus>(`/clients/${id}`, client);
  },

  deleteClient: async (id: string): Promise<void> => {
    return api.delete(`/clients/${id}`);
  },

  importFromPack: async (): Promise<{
    totalFromPack: number;
    created: number;
    updated: number;
    linked: number;
    skipped: number;
  }> => {
    return api.post(`/clients/import-from-pack`, {});
  },
}; 