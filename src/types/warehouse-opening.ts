import { Product } from './product';

export interface WarehouseOpening {
  id: string;
  warehouseId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseOpeningResponse {
  data: WarehouseOpening[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseOpeningFormData {
  warehouseId: string;
  productId: string;
  quantity: number;
  price: number;
} 