export interface Client {
  id: string;
  code: string;
  name: string;
  tax_document: string;
  description: string;
  address_street?: string;
  address_exterior?: string;
  address_interior?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_municipality?: string;
  address_zip?: string;
  address_state?: string;
  address_country?: string;
  phone: string;
  email: string;
  tax_system?: string;
  default_invoice_use?: string;
  pack_product_id?: string;
  pack_product_response?: any;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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