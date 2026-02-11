export enum ProviderAddressType {
  FISCAL = 'FISCAL',
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  OTHER = 'OTHER',
}

export interface ProviderAddress {
  id: string;
  type: ProviderAddressType;
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

export interface ProviderTaxData {
  id: string;
  tax_document: string;
  tax_system: string;
  tax_name: string;
  default_invoice_use: string;
  is_main: boolean;
  created_at: string;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  status: boolean;
  addresses?: ProviderAddress[];
  taxData?: ProviderTaxData[];
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
}

export interface ProvidersResponse {
  data: Provider[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}