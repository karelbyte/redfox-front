import { Currency } from './currency';

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

export interface WarehouseResponse {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 