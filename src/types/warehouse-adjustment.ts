export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  status: boolean;
  is_open: boolean;
  currency: Currency;
  created_at: string;
}

export interface WarehouseAdjustment {
  id: string;
  code: string;
  sourceWarehouse: Warehouse;
  targetWarehouse: Warehouse;
  date: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface WarehouseAdjustmentFormData {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  date: string;
  description: string;
}

export interface WarehouseAdjustmentCreateData extends WarehouseAdjustmentFormData {
  status: boolean;
}

export interface WarehouseAdjustmentDetailFormData {
  productId: string;
  quantity: number;
  price: number;
}

export interface WarehouseAdjustmentDetail {
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

export interface PaginatedWarehouseAdjustmentResponse {
  data: WarehouseAdjustment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedWarehouseAdjustmentDetailsResponse {
  data: WarehouseAdjustmentDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseAdjustmentCloseResponse {
  adjustmentId: string;
  adjustmentCode: string;
  transferredProducts: number;
  totalQuantity: number;
  message: string;
  closedAt: string;
} 