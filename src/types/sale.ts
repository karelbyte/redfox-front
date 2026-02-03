export interface Client {
  id: string;
  code: string;
  name: string;
  tax_document: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PackFiscalStatus = 'RECEIPT_ONLY' | 'INVOICED_DIRECT' | 'INVOICED_GLOBAL';

export interface Sale {
  id: string;
  code: string;
  destination: string;
  client: Client;
  amount: string;
  status: boolean;
  created_at: string;
  /** Estado fiscal: solo nota, facturada directa o facturada global */
  invoice_id?: string | null;
  pack_fiscal_status?: PackFiscalStatus;
  invoice_code?: string | null;
  cfdi_uuid?: string | null;
}

export interface SaleFormData {
  amount: number;
  code: string;
  destination: string;
  client_id: string;
  status?: boolean;
  type: string;
}

export interface SaleDetailFormData {
  product_id: string;
  quantity: number;
  price: number;
  warehouse_id: string;
}

export interface SaleDetail {
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

export interface PaginatedSaleResponse {
  data: Sale[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedSaleDetailsResponse {
  data: SaleDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SaleCloseResponse {
  saleId: string;
  saleCode: string;
  withdrawnProducts: number;
  totalQuantity: number;
  message: string;
  completedAt: string;
} 