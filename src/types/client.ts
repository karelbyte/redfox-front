export interface Client {
  id: string;
  code: string;
  name: string;
  description: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_document: string | null;
  status: boolean;
  created_at: string;
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