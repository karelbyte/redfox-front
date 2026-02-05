export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_document: string;
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

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export interface Quotation {
  id: string;
  code: string;
  date: string;
  valid_until: string;
  client: Client;
  warehouse: Warehouse;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  converted_to_sale_id: string;
  created_at: string;
}

export interface QuotationFormData {
  code: string;
  date: string;
  valid_until?: string;
  client_id: string;
  warehouse_id: string;
  notes?: string;
}

export interface QuotationCreateData extends QuotationFormData {
  subtotal: number;
  tax: number;
  total: number;
  status: QuotationStatus;
}

export interface QuotationDetailFormData {
  product_id: string;
  quantity: string | number;
  price: string | number;
  discount_percentage?: string | number;
  discount_amount?: string | number;
}

export interface QuotationDetail {
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
  quantity: string | number;
  price: string | number;
  discount_percentage: string | number;
  discount_amount: string | number;
  subtotal: string | number;
  created_at: string;
}

export interface PaginatedQuotationResponse {
  data: Quotation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedQuotationDetailsResponse {
  data: QuotationDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConvertToSaleResponse {
  quotationId: string;
  quotationCode: string;
  saleId: string;
  saleCode: string;
  totalProducts: number;
  totalAmount: number;
  message: string;
  convertedAt: string;
}