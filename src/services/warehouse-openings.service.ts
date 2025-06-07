import { api } from './api';
import { WarehouseOpeningResponse, WarehouseOpening, WarehouseOpeningFormData } from '@/types/warehouse-opening';

class WarehouseOpeningsService {
  async getWarehouseOpenings(
    warehouseId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<WarehouseOpeningResponse> {
    const response = await api.get<WarehouseOpeningResponse>(
      `/warehouse-openings?warehouse_id=${warehouseId}&page=${page}&limit=${limit}`
    );
    return response;
  }

  async createWarehouseOpening(data: WarehouseOpeningFormData): Promise<WarehouseOpening> {
    const payload: Record<string, unknown> = {
      warehouseId: data.warehouseId,
      productId: data.productId,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.post<WarehouseOpening>('/warehouse-openings', payload);
    return response;
  }

  async updateWarehouseOpening(id: string, data: Partial<WarehouseOpeningFormData>): Promise<WarehouseOpening> {
    const payload: Record<string, unknown> = {};
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.price !== undefined) payload.price = data.price;
    
    const response = await api.put<WarehouseOpening>(`/warehouse-openings/${id}`, payload);
    return response;
  }

  async deleteWarehouseOpening(id: string): Promise<void> {
    await api.delete(`/warehouse-openings/${id}`);
  }
}

export const warehouseOpeningsService = new WarehouseOpeningsService(); 