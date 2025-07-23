import { Provider } from './provider';
import { Warehouse } from './warehouse';

export interface PurchaseOrder {
  id: string;
  code: string;
  date: string;
  provider: Provider;
  warehouse: Warehouse;
  document: string;
  amount: number;
  notes?: string;
  expected_delivery_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderFormData {
  code: string;
  date: string;
  provider_id: string;
  warehouse_id: string;
  document: string;
  amount: number;
  notes?: string;
  expected_delivery_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  [key: string]: unknown;
}

export interface PurchaseOrderDetail {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    weight: number;
    width: number;
    height: number;
    length: number;
    brand: {
      id: string;
      name: string;
      description: string;
    };
    category: {
      id: string;
      name: string;
      description: string;
    };
    tax: {
      id: string;
      code: string;
      name: string;
      value: number;
      type: string;
      isActive: boolean;
      createdAt: string;
    };
    measurement_unit: {
      id: string;
      code: string;
      description: string;
    };
    is_active: boolean;
    type: string;
    images: string[];
    created_at: string;
  };
  quantity: number;
  price: number;
  created_at: string;
}

export interface PurchaseOrderDetailFormData {
  product_id: string;
  quantity: number;
  price: number;
  [key: string]: unknown;
}

export interface PaginatedPurchaseOrderResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedPurchaseOrderDetailsResponse {
  data: PurchaseOrderDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PurchaseOrderApprovalResponse {
  purchaseOrderId: string;
  purchaseOrderCode: string;
  status: string;
  message: string;
  approvedAt: string;
}

export interface PurchaseOrderRejectionResponse {
  purchaseOrderId: string;
  purchaseOrderCode: string;
  status: string;
  message: string;
  rejectedAt: string;
}

export interface PurchaseOrderCancellationResponse {
  purchaseOrderId: string;
  purchaseOrderCode: string;
  status: string;
  message: string;
  cancelledAt: string;
} 