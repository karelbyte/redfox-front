import { api } from './api';
import { InventoryResponse } from '@/types/inventory';

class InventoryService {
  async getInventory(warehouseId: string, page: number = 1): Promise<InventoryResponse> {
    const response = await api.get<InventoryResponse>(`/inventory?warehouse_id=${warehouseId}&page=${page}`);
    return response;
  }
}

export const inventoryService = new InventoryService(); 