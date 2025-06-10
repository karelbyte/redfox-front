import { Product } from './product';
import { ApiResponse } from './api';

export interface InventoryItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
}

export interface InventoryResponse extends ApiResponse<InventoryItem[]> {} 