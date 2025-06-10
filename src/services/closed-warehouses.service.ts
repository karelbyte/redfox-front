import { api } from './api';
import { ClosedWarehouse } from '@/types/closed-warehouse';

class ClosedWarehousesService {
  async getClosedWarehouses(): Promise<ClosedWarehouse[]> {
    const response = await api.get<ClosedWarehouse[]>('/warehouses/closed');
    return response;
  }
}

export const closedWarehousesService = new ClosedWarehousesService(); 