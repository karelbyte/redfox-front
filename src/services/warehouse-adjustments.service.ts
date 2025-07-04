import { api } from './api';
import {
  WarehouseAdjustment,
  WarehouseAdjustmentFormData,
  WarehouseAdjustmentDetailFormData,
  WarehouseAdjustmentDetail,
  PaginatedWarehouseAdjustmentResponse,
  PaginatedWarehouseAdjustmentDetailsResponse,
  WarehouseAdjustmentCloseResponse
} from '@/types/warehouse-adjustment';

class WarehouseAdjustmentService {
  async getWarehouseAdjustments(page?: number): Promise<PaginatedWarehouseAdjustmentResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedWarehouseAdjustmentResponse>(`/warehouse-adjustments${queryParam}`);
    return response;
  }

  async createWarehouseAdjustment(data: WarehouseAdjustmentFormData): Promise<WarehouseAdjustment> {
    const createData: Record<string, unknown> = {
      ...data,
      status: false // Siempre se crea como activa
    };
    const response = await api.post<WarehouseAdjustment>('/warehouse-adjustments', createData);
    return response;
  }

  async updateWarehouseAdjustment(id: string, data: WarehouseAdjustmentFormData): Promise<WarehouseAdjustment> {
    // No enviamos el status en la edición, el backend lo mantendrá
    const updateData: Record<string, unknown> = { ...data };
    const response = await api.put<WarehouseAdjustment>(`/warehouse-adjustments/${id}`, updateData);
    return response;
  }

  async deleteWarehouseAdjustment(id: string): Promise<void> {
    await api.delete(`/warehouse-adjustments/${id}`);
  }

  async closeWarehouseAdjustment(id: string): Promise<WarehouseAdjustmentCloseResponse> {
    const response = await api.post<WarehouseAdjustmentCloseResponse>(`/warehouse-adjustments/${id}/close`, {});
    return response;
  }

  async getWarehouseAdjustmentById(id: string): Promise<WarehouseAdjustment> {
    const response = await api.get<WarehouseAdjustment>(`/warehouse-adjustments/${id}`);
    return response;
  }

  async getWarehouseAdjustmentDetails(adjustmentId: string, page?: number): Promise<PaginatedWarehouseAdjustmentDetailsResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedWarehouseAdjustmentDetailsResponse>(`/warehouse-adjustments/${adjustmentId}/details${queryParam}`);
    return response;
  }

  async addProductToWarehouseAdjustment(adjustmentId: string, data: WarehouseAdjustmentDetailFormData): Promise<WarehouseAdjustmentDetail> {
    const requestData: Record<string, unknown> = {
      productId: data.productId,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.post<WarehouseAdjustmentDetail>(`/warehouse-adjustments/${adjustmentId}/details`, requestData);
    return response;
  }

  async updateWarehouseAdjustmentDetail(adjustmentId: string, detailId: string, data: WarehouseAdjustmentDetailFormData): Promise<WarehouseAdjustmentDetail> {
    const requestData: Record<string, unknown> = {
      productId: data.productId,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.put<WarehouseAdjustmentDetail>(`/warehouse-adjustments/${adjustmentId}/details/${detailId}`, requestData);
    return response;
  }

  async deleteWarehouseAdjustmentDetail(adjustmentId: string, detailId: string): Promise<void> {
    await api.delete(`/warehouse-adjustments/${adjustmentId}/details/${detailId}`);
  }
}

export const warehouseAdjustmentService = new WarehouseAdjustmentService(); 