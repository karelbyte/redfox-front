import { api } from './api';
import { Category, CategoryFormData } from '@/types/category';

interface PaginatedResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class CategoriesService {
  async getCategories(page: number = 1): Promise<PaginatedResponse> {
    const response = await api.get<PaginatedResponse>(`/categories?page=${page}`);
    return response.data;
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: CategoryFormData): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export const categoriesService = new CategoriesService(); 