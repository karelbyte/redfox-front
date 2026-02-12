import { api } from "./api";
import { Client, ClientsResponse, ClientWithPackStatus } from "@/types/client";
import { db } from "@/lib/db";

export const clientsService = {
  getClients: async (page?: number, term?: string, is_active?: boolean): Promise<ClientsResponse> => {
    // Try to fetch from API if online
    if (navigator.onLine) {
      try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (term) params.append('term', term);
        if (is_active !== undefined) params.append('is_active', is_active.toString());

        const queryString = params.toString();
        const url = `/clients${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<ClientsResponse>(url);

        // Cache clients in IndexedDB
        if (response.data && response.data.length > 0) {
          await db.clients.bulkPut(response.data);
        }

        return response;
      } catch (error) {
        console.error('Failed to fetch clients from API, falling back to cache:', error);
        // Fall through to offline mode
      }
    }

    // Offline mode: read from IndexedDB
    console.log('📴 Offline mode: reading clients from IndexedDB');
    let clients = await db.clients.toArray();

    // Apply filters
    if (term) {
      const searchTerm = term.toLowerCase();
      clients = clients.filter(c =>
        c.code?.toLowerCase().includes(searchTerm) ||
        c.name?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.phone?.toLowerCase().includes(searchTerm)
      );
    }

    if (is_active !== undefined) {
      clients = clients.filter(c => c.status === is_active);
    }

    // Sort by created_at desc
    clients.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Simple pagination
    const limit = 10;
    const currentPage = page || 1;
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const paginatedData = clients.slice(start, end);

    return {
      data: paginatedData,
      meta: {
        total: clients.length,
        page: currentPage,
        limit,
        totalPages: Math.ceil(clients.length / limit)
      }
    };
  },

  getClient: async (id: string): Promise<Client> => {
    if (navigator.onLine) {
      try {
        const client = await api.get<Client>(`/clients/${id}`);
        await db.clients.put(client);
        return client;
      } catch (error) {
        console.error('Failed to fetch client from API, falling back to cache:', error);
      }
    }

    // Offline: read from IndexedDB
    const client = await db.clients.get(id);
    if (!client) {
      throw new Error('Client not found in offline cache');
    }
    return client;
  },

  createClient: async (clientData: Partial<Client>): Promise<ClientWithPackStatus> => {
    if (navigator.onLine) {
      try {
        const result = await api.post<ClientWithPackStatus>("/clients", clientData);
        await db.clients.put(result.client);
        return result;
      } catch (error) {
        console.error('Failed to create client online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: create temporary client and queue operation
    const tempId = `temp_${Date.now()}`;
    const tempClient: Client = {
      id: tempId,
      code: clientData.code || '',
      name: clientData.name || '',
      description: clientData.description || '',
      phone: clientData.phone || '',
      email: clientData.email || '',
      status: clientData.status !== undefined ? clientData.status : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    await db.clients.put(tempClient);

    // Queue for sync - store the temp ID so we can replace it later
    await db.pendingOperations.add({
      type: 'CREATE',
      entity: 'client',
      entityId: tempId,
      data: clientData,
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Client queued for creation when online');
    
    return {
      client: tempClient,
      pack_sync_success: false
    };
  },

  updateClient: async (id: string, clientData: Partial<Client>): Promise<ClientWithPackStatus> => {
    if (navigator.onLine) {
      try {
        const result = await api.put<ClientWithPackStatus>(`/clients/${id}`, clientData);
        await db.clients.put(result.client);
        return result;
      } catch (error) {
        console.error('Failed to update client online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: update in IndexedDB and queue operation
    const existing = await db.clients.get(id);
    if (!existing) {
      throw new Error('Cannot update client: not found in offline cache');
    }

    const updated: Client = {
      ...existing,
      ...clientData,
      updated_at: new Date().toISOString()
    };

    await db.clients.put(updated);

    // Queue for sync
    await db.pendingOperations.add({
      type: 'UPDATE',
      entity: 'client',
      entityId: id,
      data: clientData,
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Client update queued for sync when online');
    
    return {
      client: updated,
      pack_sync_success: false
    };
  },

  deleteClient: async (id: string): Promise<void> => {
    if (navigator.onLine) {
      try {
        await api.delete(`/clients/${id}`);
        await db.clients.delete(id);
        return;
      } catch (error) {
        console.error('Failed to delete client online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: mark as deleted and queue operation
    await db.clients.delete(id);

    await db.pendingOperations.add({
      type: 'DELETE',
      entity: 'client',
      entityId: id,
      data: {},
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Client deletion queued for sync when online');
  },

  deleteClients: async (ids: string[]): Promise<void> => {
    if (navigator.onLine) {
      try {
        await api.post('/clients/bulk-delete', { ids });
        await db.clients.bulkDelete(ids);
        return;
      } catch (error) {
        console.error('Failed to bulk delete clients online, queuing for later:', error);
      }
    }

    // Offline: delete locally and queue each operation
    await db.clients.bulkDelete(ids);

    for (const id of ids) {
      await db.pendingOperations.add({
        type: 'DELETE',
        entity: 'client',
        entityId: id,
        data: {},
        timestamp: Date.now(),
        retries: 0
      });
    }

    console.log(`📴 ${ids.length} client deletions queued for sync when online`);
  },

  importFromPack: async (): Promise<{
    totalFromPack: number;
    created: number;
    updated: number;
    linked: number;
    skipped: number;
  }> => {
    // Esta operación solo funciona online
    if (!navigator.onLine) {
      throw new Error('Import from pack requires internet connection');
    }
    return api.post(`/clients/import-from-pack`, {});
  },
}; 