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

class ProductService {
  async getProducts(page?: number, term?: string, is_active?: boolean, type?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    if (is_active) params.append('is_active', is_active.toString());
    if (type) params.append('type', type);
    const queryString = params.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse>(url);
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