import { api } from './api';
import { InventoryResponse, InventoryItem } from '@/types/inventory';

export interface InventoryProduct {
  id: string;
  product: {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    base_price: number;
    prices?: {
      id: string;
      name: string;
      price: number;
    }[];
    cost: number;
    stock_min: number;
    stock_max: number;
    is_active: boolean;
    type: string;
    images: string[];
    brand: {
      id: string;
      name: string;
      description: string;
    };
    category: {
      id: string;
      name: string;
      description: string;
    };
    tax: {
      id: string;
      name: string;
      percentage: number;
    };
    measurement_unit: {
      id: string;
      name: string;
      symbol: string;
    };
    created_at: string;
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
  createdAt: string;
}

export interface PaginatedInventoryResponse {
  data: InventoryProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class InventoryService {
  async getInventory(warehouseId: string, page?: number, term?: string): Promise<InventoryResponse> {
    const params = new URLSearchParams();
    params.append('warehouse_id', warehouseId);
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/inventory${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<InventoryResponse>(url);
    return response;
  }

  async getInventoryProducts(page: number = 1, term?: string): Promise<PaginatedInventoryResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (term) {
      params.append('term', term);
    }
    
    const response = await api.get<PaginatedInventoryResponse>(`/inventory/products?${params.toString()}`);
    return response;
  }

  async syncWithPack(inventoryId: string): Promise<{
    inventory: InventoryItem;
    pack_sync_success: boolean;
    pack_sync_error?: string;
  }> {
    const response = await api.post<{
      inventory: InventoryItem;
      pack_sync_success: boolean;
      pack_sync_error?: string;
    }>(`/inventory/${inventoryId}/sync-pack`, {});
    return response;
  }
}

export const inventoryService = new InventoryService(); 