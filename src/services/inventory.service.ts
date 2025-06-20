import { api } from './api';
import { InventoryResponse } from '@/types/inventory';

class InventoryService {
  async getInventory(warehouseId: string, page?: number): Promise<InventoryResponse> {
    const params = new URLSearchParams();
    params.append('warehouse_id', warehouseId);
    if (page) params.append('page', page.toString());
    
    const queryString = params.toString();
    const url = `/inventory${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<InventoryResponse>(url);
    return response;
  }
}

export const inventoryService = new InventoryService(); 