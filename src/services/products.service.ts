import { api } from './api';
import { Product } from '@/types/product';

interface PaginatedResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GetProductsParams {
  page?: number;
  term?: string;
}

class ProductService {
  async getProducts(page: number = 1, term?: string): Promise<PaginatedResponse> {
    const params: GetProductsParams = { page };
    if (term && term.trim()) {
      params.term = term.trim();
    }
    
    const response = await api.get<PaginatedResponse>('/products', params);
    return response;
  }

  async createProduct(data: Partial<Product>, imageFiles?: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Agregar archivos de imagen si existen
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append(`images`, file);
      });
    }

    const response = await api.post<Product>('/products', formData);
    return response;
  }

  async updateProduct(id: string, data: Partial<Product>, imageFiles?: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Agregar archivos de imagen si existen
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append(`images`, file);
      });
    }

    const response = await api.put<Product>(`/products/${id}`, formData);
    return response;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response;
  }
}

export const productService = new ProductService(); 