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

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 