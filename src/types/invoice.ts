import { Client } from './client';

export interface Invoice {
  id: string;
  code: string;
  date: string;
  client: Client;
  withdrawal?: Withdrawal | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  /**
   * Comprobante SUNAT asignado a la factura. Nulo en los packs que no numeran
   * por serie, como el CFDI mexicano.
   */
  document_type?: string | null;
  series?: string | null;
  number?: number | null;
  /** Moneda del comprobante en ISO 4217. Nulo usa la del pack. */
  currency_code?: string | null;
  cfdi_uuid?: string | null;
  /** ID interno del comprobante en el PAC activo. Escalable para cualquier pack. */
  pack_invoice_id?: string | null;
  pack_invoice_response?: Record<string, unknown> | null;
  payment_method: PaymentMethod;
  payment_conditions?: string | null;
  notes?: string | null;
  details: InvoiceDetail[];
  created_at: string;
}

export interface InvoiceDetail {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  product: Product;
  created_at: string;
}

export interface InvoiceFormData {
  code: string;
  date: string;
  client_id: string;
  currency_code?: string;
  payment_method: PaymentMethod;
  payment_conditions?: string;
  notes?: string;
  details: InvoiceDetailFormData[];
}

export interface InvoiceDetailFormData {
  product_id: string;
  quantity: number;
  price: number;
  tax_rate: number;
}

export interface ConvertWithdrawalData {
  withdrawal_id: string;
  invoice_code: string;
  status?: InvoiceStatus;
}

export interface GlobalInvoiceFormData {
  from: string;
  to: string;
  periodicity: 'day' | 'week' | 'fortnight' | 'month' | 'two_months';
}

export interface PaginatedInvoiceResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedInvoiceDetailsResponse {
  data: InvoiceDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_CFDI = 'PENDING_CFDI',
  SENT = 'SENT',
  FAILED_CFDI = 'FAILED_CFDI',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHECK = 'check',
  CREDIT = 'credit',
}

export enum InvoicePaymentStatus {
  PENDING = 'pending',
  STAMPED = 'stamped',
  CANCELLED = 'cancelled',
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_number: number;
  amount: number;
  payment_date: string;
  payment_form: string;
  balance_before: number;
  balance_after: number;
  status: InvoicePaymentStatus;
  pack_complement_id: string | null;
  cfdi_complement_uuid: string | null;
  notes: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  code: string;
  destination: string;
  amount: number;
  type: string;
  status: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  brand?: Brand;
  category?: Category;
  tax?: Tax;
  measurement_unit: MeasurementUnit;
  is_active: boolean;
  type: 'digital' | 'service' | 'tangible';
  images: string[];
  currency?: { id: string; code: string; name: string } | null;
  created_at: string;
}

export interface Brand {
  id: string;
  code: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
}

export interface Tax {
  id: string;
  code: string;
  name: string;
  rate: number;
  description: string;
  status: boolean;
  created_at: string;
}

export interface MeasurementUnit {
  id: string;
  code: string;
  description: string;
  status: boolean;
  created_at: string;
}
