export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string | null;
  status: boolean;
  created_at: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 