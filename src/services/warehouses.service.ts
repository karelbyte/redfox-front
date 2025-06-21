import { api } from './api';
import { Warehouse, WarehouseResponse, WarehouseCloseResponse } from '@/types/warehouse';

interface GetWarehousesParams {
  page?: number;
  isClosed?: boolean;
}

class WarehousesService {
  async getWarehouses(params: GetWarehousesParams): Promise<WarehouseResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params.isClosed !== undefined) {
      searchParams.append('isClosed', params.isClosed.toString());
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `/warehouses?${queryString}` : '/warehouses';
    
    const response = await api.get<WarehouseResponse>(url);
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