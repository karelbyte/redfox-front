import { api } from './api';
import { Warehouse } from '@/types/warehouse';

interface PaginatedResponse {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class WarehousesService {
  async getWarehouses(page: number = 1): Promise<PaginatedResponse> {
    const response = await api.get<PaginatedResponse>(`/warehouses?page=${page}`);
    return response;
  }

  async createWarehouse(data: Omit<Warehouse, 'id' | 'created_at'>): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response;
  }

  async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put<Warehouse>(`/warehouses/${id}`, data);
    return response;
  }

  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  }
}

export const warehousesService = new WarehousesService(); 