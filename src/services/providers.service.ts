import { api } from "./api";
import { Provider, ProvidersResponse } from "@/types/provider";
import { db } from "@/lib/db";

export const providersService = {
  getProviders: async (page?: number, term?: string, is_active?: boolean): Promise<ProvidersResponse> => {
    // Try to fetch from API if online
    if (navigator.onLine) {
      try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (term) params.append('term', term);
        if (is_active !== undefined) params.append('is_active', is_active.toString());

        const queryString = params.toString();
        const url = `/providers${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<ProvidersResponse>(url);

        // Cache providers in IndexedDB
        if (response.data && response.data.length > 0) {
          await db.providers.bulkPut(response.data);
        }

        return response;
      } catch (error) {
        console.error('Failed to fetch providers from API, falling back to cache:', error);
        // Fall through to offline mode
      }
    }

    // Offline mode: read from IndexedDB
    console.log('📴 Offline mode: reading providers from IndexedDB');
    let providers = await db.providers.toArray();

    // Apply filters
    if (term) {
      const searchTerm = term.toLowerCase();
      providers = providers.filter(p =>
        p.code?.toLowerCase().includes(searchTerm) ||
        p.name?.toLowerCase().includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm) ||
        p.phone?.toLowerCase().includes(searchTerm)
      );
    }

    if (is_active !== undefined) {
      providers = providers.filter(p => p.status === is_active);
    }

    // Sort by created_at desc
    providers.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Simple pagination
    const limit = 10;
    const currentPage = page || 1;
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const paginatedData = providers.slice(start, end);

    return {
      data: paginatedData,
      meta: {
        total: providers.length,
        page: currentPage,
        limit,
        totalPages: Math.ceil(providers.length / limit)
      }
    };
  },

  getProvider: async (id: string): Promise<Provider> => {
    if (navigator.onLine) {
      try {
        const provider = await api.get<Provider>(`/providers/${id}`);
        await db.providers.put(provider);
        return provider;
      } catch (error) {
        console.error('Failed to fetch provider from API, falling back to cache:', error);
      }
    }

    // Offline: read from IndexedDB
    const provider = await db.providers.get(id);
    if (!provider) {
      throw new Error('Provider not found in offline cache');
    }
    return provider;
  },

  createProvider: async (providerData: any): Promise<Provider> => {
    if (navigator.onLine) {
      try {
        const provider = await api.post<Provider>("/providers", providerData);
        await db.providers.put(provider);
        return provider;
      } catch (error) {
        console.error('Failed to create provider online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: create temporary provider and queue operation
    const tempId = `temp_${Date.now()}`;
    const tempProvider: Provider = {
      id: tempId,
      ...providerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    await db.providers.put(tempProvider);

    // Queue for sync
    await db.pendingOperations.add({
      type: 'CREATE',
      entity: 'provider',
      data: providerData,
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Provider queued for creation when online');
    return tempProvider;
  },

  updateProvider: async (id: string, providerData: any): Promise<Provider> => {
    if (navigator.onLine) {
      try {
        const provider = await api.put<Provider>(`/providers/${id}`, providerData);
        await db.providers.put(provider);
        return provider;
      } catch (error) {
        console.error('Failed to update provider online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: update in IndexedDB and queue operation
    const existing = await db.providers.get(id);
    if (!existing) {
      throw new Error('Cannot update provider: not found in offline cache');
    }

    const updated: Provider = {
      ...existing,
      ...providerData,
      updated_at: new Date().toISOString()
    };

    await db.providers.put(updated);

    // Queue for sync
    await db.pendingOperations.add({
      type: 'UPDATE',
      entity: 'provider',
      entityId: id,
      data: providerData,
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Provider update queued for sync when online');
    return updated;
  },

  deleteProvider: async (id: string): Promise<void> => {
    if (navigator.onLine) {
      try {
        await api.delete(`/providers/${id}`);
        await db.providers.delete(id);
        return;
      } catch (error) {
        console.error('Failed to delete provider online, queuing for later:', error);
        // Fall through to offline mode
      }
    }

    // Offline: mark as deleted and queue operation
    await db.providers.delete(id);

    await db.pendingOperations.add({
      type: 'DELETE',
      entity: 'provider',
      entityId: id,
      data: {},
      timestamp: Date.now(),
      retries: 0
    });

    console.log('📴 Provider deletion queued for sync when online');
  },

  deleteProviders: async (ids: string[]): Promise<void> => {
    if (navigator.onLine) {
      try {
        await api.post('/providers/bulk-delete', { ids });
        await db.providers.bulkDelete(ids);
        return;
      } catch (error) {
        console.error('Failed to bulk delete providers online, queuing for later:', error);
      }
    }

    // Offline: delete locally and queue each operation
    await db.providers.bulkDelete(ids);

    for (const id of ids) {
      await db.pendingOperations.add({
        type: 'DELETE',
        entity: 'provider',
        entityId: id,
        data: {},
        timestamp: Date.now(),
        retries: 0
      });
    }

    console.log(`📴 ${ids.length} provider deletions queued for sync when online`);
  },
};