import { api } from './api';
import { Shipment, CreateShipmentDto, UpdateShipmentDto } from '../types/shipment';

// Interfaces for response
export interface PaginatedShipmentsResponse {
  data: Shipment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ShipmentService {
  async getAllShipments(params: { page: number; limit: number; search?: string; status?: string }): Promise<PaginatedShipmentsResponse> {
    return api.get<PaginatedShipmentsResponse>('/shipments', params);
  }

  async getShipmentsBySale(saleId: string): Promise<Shipment[]> {
    return api.get<Shipment[]>(`/withdrawals/${saleId}/shipments`);
  }

  async getShipment(id: string): Promise<Shipment> {
    return api.get<Shipment>(`/shipments/${id}`);
  }

  async createShipment(saleId: string, data: CreateShipmentDto): Promise<Shipment> {
    return api.post<Shipment>(`/withdrawals/${saleId}/shipments`, data as unknown as Record<string, unknown>);
  }

  async updateShipment(id: string, data: UpdateShipmentDto): Promise<Shipment> {
    return api.put<Shipment>(`/shipments/${id}`, data as unknown as Record<string, unknown>);
  }

  async deleteShipment(id: string): Promise<void> {
    return api.delete(`/shipments/${id}`);
  }

  async getAnalytics(): Promise<{
    total: number;
    by_status: Record<string, number>;
    avg_shipping_cost: number;
    avg_delivery_days: number;
  }> {
    return api.get('/shipments/analytics');
  }
}

export const shipmentService = new ShipmentService();
