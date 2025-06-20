import { api } from "./api";
import { Client, ClientsResponse } from "@/types/client";

interface GetClientsParams {
  page?: number;
  term?: string;
}

export const clientsService = {
  getClients: async (page: number = 1, term?: string): Promise<ClientsResponse> => {
    const params: GetClientsParams = { page };
    if (term && term.trim()) {
      params.term = term.trim();
    }
    
    return api.get<ClientsResponse>("/clients", params);
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