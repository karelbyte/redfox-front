import { api } from './api';
import { Sale, SaleFormData, SaleDetailFormData, SaleDetail, PaginatedSaleResponse, PaginatedSaleDetailsResponse } from '@/types/sale';

class SaleService {
  async getSales(page?: number): Promise<PaginatedSaleResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedSaleResponse>(`/withdrawals${queryParam}`);
    return response;
  }

  async createSale(data: SaleFormData): Promise<Sale> {
    const createData: Record<string, unknown> = {
      amount: 0,
      code: data.code,
      destination: data.destination,
      client_id: data.client_id,
      status: true // Por defecto true según la especificación
    };
    const response = await api.post<Sale>('/withdrawals', createData);
    return response;
  }

  async updateSale(id: string, data: SaleFormData): Promise<Sale> {
    const updateData: Record<string, unknown> = {
      code: data.code,
      destination: data.destination,
      client_id: data.client_id,
      status: data.status
    };
    const response = await api.put<Sale>(`/withdrawals/${id}`, updateData);
    return response;
  }

  async deleteSale(id: string): Promise<void> {
    await api.delete(`/withdrawals/${id}`);
  }

  async getSaleById(id: string): Promise<Sale> {
    const response = await api.get<Sale>(`/withdrawals/${id}`);
    return response;
  }

  async getSaleDetails(saleId: string, page?: number): Promise<PaginatedSaleDetailsResponse> {
    const queryParam = page ? `?page=${page}` : '';
    const response = await api.get<PaginatedSaleDetailsResponse>(`/withdrawals/${saleId}/details${queryParam}`);
    return response;
  }

  async addProductToSale(saleId: string, data: SaleDetailFormData): Promise<SaleDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.post<SaleDetail>(`/withdrawals/${saleId}/details`, requestData);
    return response;
  }

  async updateSaleDetail(saleId: string, detailId: string, data: SaleDetailFormData): Promise<SaleDetail> {
    const requestData: Record<string, unknown> = {
      product_id: data.product_id,
      quantity: data.quantity,
      price: data.price
    };
    const response = await api.put<SaleDetail>(`/withdrawals/${saleId}/details/${detailId}`, requestData);
    return response;
  }

  async deleteSaleDetail(saleId: string, detailId: string): Promise<void> {
    await api.delete(`/withdrawals/${saleId}/details/${detailId}`);
  }
}

export const saleService = new SaleService(); 