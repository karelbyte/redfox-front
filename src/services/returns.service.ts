import { api } from './api';
import {
  Return,
  ReturnFormData,
  ReturnDetailFormData,
  ReturnDetail,
  PaginatedReturnResponse,
  PaginatedReturnDetailsResponse,
  ReturnCloseResponse
} from '@/types/return';

class ReturnService {
  async getReturns(page?: number): Promise<PaginatedReturnResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedReturnResponse>(`/returns${queryParam}`);
    return response;
  }

  async createReturn(data: ReturnFormData): Promise<Return> {
    const createData: Record<string, unknown> = {
      ...data,
      status: false // Siempre se crea como activa
    };
    const response = await api.post<Return>('/returns', createData);
    return response;
  }

  async updateReturn(id: string, data: ReturnFormData): Promise<Return> {
    // No enviamos el status en la edición, el backend lo mantendrá
    const updateData: Record<string, unknown> = { ...data };
    const response = await api.put<Return>(`/returns/${id}`, updateData);
    return response;
  }

  async deleteReturn(id: string): Promise<void> {
    await api.delete(`/returns/${id}`);
  }

  async closeReturn(id: string): Promise<ReturnCloseResponse> {
    const response = await api.post<ReturnCloseResponse>(`/returns/${id}/process`, {});
    return response;
  }

  async getReturnById(id: string): Promise<Return> {
    const response = await api.get<Return>(`/returns/${id}`);
    return response;
  }

  async getReturnDetails(returnId: string, page?: number): Promise<PaginatedReturnDetailsResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedReturnDetailsResponse>(`/returns/${returnId}/details${queryParam}`);
    return response;
  }

  async addProductToReturn(returnId: string, data: ReturnDetailFormData): Promise<ReturnDetail> {
    const requestData: Record<string, unknown> = {
      productId: data.productId,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.post<ReturnDetail>(`/returns/${returnId}/details`, requestData);
    return response;
  }

  async updateReturnDetail(returnId: string, detailId: string, data: ReturnDetailFormData): Promise<ReturnDetail> {
    const requestData: Record<string, unknown> = {
      productId: data.productId,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.put<ReturnDetail>(`/returns/${returnId}/details/${detailId}`, requestData);
    return response;
  }

  async deleteReturnDetail(returnId: string, detailId: string): Promise<void> {
    await api.delete(`/returns/${returnId}/details/${detailId}`);
  }
}

export const returnService = new ReturnService(); 