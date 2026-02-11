export enum AddressType {
  FISCAL = 'FISCAL',
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  OTHER = 'OTHER',
}

export interface ClientAddress {
  id: string;
  type: AddressType;
  street: string;
  exterior_number: string;
  interior_number: string;
  neighborhood: string;
  city: string;
  municipality: string;
  zip_code: string;
  state: string;
  country: string;
  is_main: boolean;
  created_at: string;
}

export interface ClientTaxData {
  id: string;
  tax_document: string;
  tax_system: string;
  tax_name: string;
  default_invoice_use: string;
  is_main: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  status: boolean;
  pack_client_id?: string;
  pack_client_response?: any;
  addresses?: ClientAddress[];
  taxData?: ClientTaxData[];
  credit?: {
    id: string;
    credit_limit: number;
    credit_days: number;
    is_active: boolean;
    currency_id?: string;
    currency?: {
      id: string;
      code: string;
      name: string;
    };
    created_at: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Campos legacy para compatibilidad durante la transición (si se necesitan)
  tax_document?: string;
  tax_system?: string;
  default_invoice_use?: string;
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientWithPackStatus {
  client: Client;
  pack_sync_success: boolean;
  pack_sync_error?: string;
}