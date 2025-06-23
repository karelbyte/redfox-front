export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
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

export interface Reception {
  id: string;
  code: string;
  date: string;
  provider: Provider;
  warehouse: Warehouse;
  document: string;
  amount: number;
  status: boolean;
  created_at: string;
}

export interface ReceptionFormData {
  code: string;
  date: string;
  provider_id: string;
  warehouse_id: string;
  document: string;
}

export interface ReceptionCreateData extends ReceptionFormData {
  amount: number;
  status: boolean;
}

export interface ReceptionDetailFormData {
  product_id: string;
  quantity: number;
  price: number;
}

export interface ReceptionDetail {
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

export interface PaginatedReceptionResponse {
  data: Reception[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedReceptionDetailsResponse {
  data: ReceptionDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReceptionCloseResponse {
  receptionId: string;
  receptionCode: string;
  transferredProducts: number;
  totalQuantity: number;
  message: string;
  closedAt: string;
} 