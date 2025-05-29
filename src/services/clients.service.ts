import { api } from "./api";
import { Client, ClientsResponse } from "@/types/client";

export const clientsService = {
  getClients: async (page: number = 1): Promise<ClientsResponse> => {
    return api.get<ClientsResponse>("/clients", { page });
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