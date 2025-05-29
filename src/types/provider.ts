export interface Provider {
  id: string;
  code: string;
  description: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: boolean;
  created_at: string;
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