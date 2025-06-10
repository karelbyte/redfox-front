import { api } from './api';
import { ProductHistoryItem } from '@/types/product-history';
import { ApiResponse } from '@/types/api';

class ProductHistoryService {
  async getProductHistory(productId: string, warehouseId: string, page: number = 1): Promise<ApiResponse<ProductHistoryItem[]>> {
    const response = await api.get<ApiResponse<ProductHistoryItem[]>>(`/product-history/product/${productId}/warehouse/${warehouseId}?page=${page}`);
    return response;
  }
}

export const productHistoryService = new ProductHistoryService(); 