import { api } from "./api";
import { Client, ClientsResponse } from "@/types/client";

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

  createClient: async (client: Omit<Client, "id" | "created_at">): Promise<Client> => {
    return api.post<Client>("/clients", client);
  },

  updateClient: async (id: string, client: Partial<Client>): Promise<Client> => {
    return api.put<Client>(`/clients/${id}`, client);
  },

  deleteClient: async (id: string): Promise<void> => {
    return api.delete(`/clients/${id}`);
  },
}; 