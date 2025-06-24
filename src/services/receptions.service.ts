import { api } from './api';
import { Reception, ReceptionFormData, ReceptionDetailFormData, ReceptionDetail, PaginatedReceptionResponse, PaginatedReceptionDetailsResponse, ReceptionCloseResponse } from '@/types/reception';

class ReceptionService {
  async getReceptions(page?: number): Promise<PaginatedReceptionResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedReceptionResponse>(`/receptions${queryParam}`);
    return response;
  }

  async createReception(data: ReceptionFormData): Promise<Reception> {
    const createData: Record<string, unknown> = {
      ...data,
      amount: 0, // El backend calculará el monto basado en los productos
      status: false // Siempre se crea como activa
    };
    const response = await api.post<Reception>('/receptions', createData);
    return response;
  }

  async updateReception(id: string, data: ReceptionFormData): Promise<Reception> {
    // No enviamos el monto ni el status en la edición, el backend los mantendrá
    const updateData: Record<string, unknown> = { ...data };
    const response = await api.put<Reception>(`/receptions/${id}`, updateData);
    return response;
  }

  async deleteReception(id: string): Promise<void> {
    await api.delete(`/receptions/${id}`);
  }

  async closeReception(id: string): Promise<ReceptionCloseResponse> {
    const response = await api.post<ReceptionCloseResponse>(`/receptions/${id}/close`, {});
    return response;
  }

  async getReceptionById(id: string): Promise<Reception> {
    const response = await api.get<Reception>(`/receptions/${id}`);
    return response;
  }

  async getReceptionDetails(receptionId: string, page?: number): Promise<PaginatedReceptionDetailsResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedReceptionDetailsResponse>(`/receptions/${receptionId}/details${queryParam}`);
    return response;
  }

  async addProductToReception(receptionId: string, data: ReceptionDetailFormData): Promise<ReceptionDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.post<ReceptionDetail>(`/receptions/${receptionId}/details`, requestData);
    return response;
  }

  async updateReceptionDetail(receptionId: string, detailId: string, data: ReceptionDetailFormData): Promise<ReceptionDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.put<ReceptionDetail>(`/receptions/${receptionId}/details/${detailId}`, requestData);
    return response;
  }

  async deleteReceptionDetail(receptionId: string, detailId: string): Promise<void> {
    await api.delete(`/receptions/${receptionId}/details/${detailId}`);
  }
}

export const receptionService = new ReceptionService(); 