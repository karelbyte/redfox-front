import { api } from './api';
import { Warehouse, WarehouseResponse, WarehouseCloseResponse } from '@/types/warehouse';

class WarehousesService {
  async getWarehouses(page: number = 1): Promise<WarehouseResponse> {
    const response = await api.get<WarehouseResponse>(`/warehouses?page=${page}`);
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

  async getWarehouse(id: string): Promise<Warehouse> {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response;
  }

  async updateStatus(id: string, isOpen: boolean): Promise<Warehouse> {
    const response = await api.patch<Warehouse>(`/warehouses/${id}/status`, { isOpen });
    return response;
  }

  async closeWarehouse(id: string): Promise<WarehouseCloseResponse> {
    const response = await api.post<WarehouseCloseResponse>(`/warehouses/${id}/close`, {});
    return response;
  }
}

export const warehousesService = new WarehousesService(); 