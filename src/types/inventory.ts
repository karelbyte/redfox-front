import { Product } from './product';
import { ApiResponse } from './api';

export interface InventoryItem {
  id: string;
  product: Product & {
    price: number;
    cost: number;
    stock_min: number;
    stock_max: number;
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
    address: string;
    phone: string;
    status: boolean;
    is_open: boolean;
    currency: {
      id: string;
      code: string;
      name: string;
    };
    created_at: string;
  };
  quantity: number;
  price: number;
  batch_number?: string;
  expiration_date?: string;
  entry_id?: string;
  createdAt: string;
}

export type InventoryResponse = ApiResponse<InventoryItem[]>; 