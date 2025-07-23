import { api } from './api';
import { 
  PurchaseOrder, 
  PurchaseOrderFormData, 
  PurchaseOrderDetail, 
  PurchaseOrderDetailFormData,
  PaginatedPurchaseOrderResponse,
  PaginatedPurchaseOrderDetailsResponse,
  PurchaseOrderApprovalResponse,
  PurchaseOrderRejectionResponse,
  PurchaseOrderCancellationResponse
} from '@/types/purchase-order';

export interface GetPurchaseOrdersParams {
  page?: number;
  status?: string;
}

class PurchaseOrdersService {
  async getPurchaseOrders(params: GetPurchaseOrdersParams = {}): Promise<PaginatedPurchaseOrderResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params.status) {
      searchParams.append('status', params.status);
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `/purchase-orders?${queryString}` : '/purchase-orders';
    
    const response = await api.get<PaginatedPurchaseOrderResponse>(url);
    return response;
  }

  async createPurchaseOrder(data: PurchaseOrderFormData): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>('/purchase-orders', data);
    return response;
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
    const response = await api.put<PurchaseOrder>(`/purchase-orders/${id}`, data);
    return response;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await api.delete(`/purchase-orders/${id}`);
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return response;
  }

  async approvePurchaseOrder(id: string): Promise<PurchaseOrderApprovalResponse> {
    const response = await api.post<PurchaseOrderApprovalResponse>(`/purchase-orders/${id}/approve`, {});
    return response;
  }

  async rejectPurchaseOrder(id: string): Promise<PurchaseOrderRejectionResponse> {
    const response = await api.post<PurchaseOrderRejectionResponse>(`/purchase-orders/${id}/reject`, {});
    return response;
  }

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrderCancellationResponse> {
    const response = await api.post<PurchaseOrderCancellationResponse>(`/purchase-orders/${id}/cancel`, {});
    return response;
  }

  async getPurchaseOrderDetails(id: string): Promise<PaginatedPurchaseOrderDetailsResponse> {
    const response = await api.get<PaginatedPurchaseOrderDetailsResponse>(`/purchase-orders/${id}/details`);
    return response;
  }

  async createPurchaseOrderDetail(id: string, data: PurchaseOrderDetailFormData): Promise<PurchaseOrderDetail> {
    const response = await api.post<PurchaseOrderDetail>(`/purchase-orders/${id}/details`, data);
    return response;
  }

  async updatePurchaseOrderDetail(id: string, detailId: string, data: PurchaseOrderDetailFormData): Promise<PurchaseOrderDetail> {
    const response = await api.put<PurchaseOrderDetail>(`/purchase-orders/${id}/details/${detailId}`, data);
    return response;
  }

  async deletePurchaseOrderDetail(id: string, detailId: string): Promise<void> {
    await api.delete(`/purchase-orders/${id}/details/${detailId}`);
  }

  async getPurchaseOrderDetail(id: string, detailId: string): Promise<PurchaseOrderDetail> {
    const response = await api.get<PurchaseOrderDetail>(`/purchase-orders/${id}/details/${detailId}`);
    return response;
  }
}

export const purchaseOrdersService = new PurchaseOrdersService(); 