import { api } from './api';
import { Reception, ReceptionFormData, PaginatedReceptionResponse } from '@/types/reception';

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

  async getReceptionById(id: string): Promise<Reception> {
    const response = await api.get<Reception>(`/receptions/${id}`);
    return response;
  }
}

export const receptionService = new ReceptionService(); 