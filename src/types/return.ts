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

export interface Provider {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxDocument: string;
  status: boolean;
  created_at: string;
}

export interface Return {
  id: string;
  code: string;
  sourceWarehouse: Warehouse;
  targetProvider: Provider;
  date: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface ReturnFormData {
  code: string;
  sourceWarehouseId: string;
  targetProviderId: string;
  date: string;
  description: string;
}

export interface ReturnCreateData extends ReturnFormData {
  status: boolean;
}

export interface ReturnDetailFormData {
  productId: string;
  quantity: number;
  price: number;
}

export interface ReturnDetail {
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

export interface PaginatedReturnResponse {
  data: Return[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedReturnDetailsResponse {
  data: ReturnDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReturnCloseResponse {
  id: string;
  code: string;
  sourceWarehouse: Warehouse;
  targetProvider: Provider;
  date: string;
  description: string;
  status: boolean;
  details: ReturnDetail[];
  created_at: string;
} 