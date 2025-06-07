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

export interface WarehouseCloseResponse {
  warehouseId: string;
  warehouseName: string;
  transferredProducts: number;
  totalQuantity: number;
  message: string;
  closedAt: string;
} 