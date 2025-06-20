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
  async getCategories(page?: number, term?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/categories${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse>(url);
    return response;
  }

  async createCategory(data: CategoryFormData, imageFile?: File): Promise<Category> {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('slug', data.slug);
    formData.append('isActive', data.isActive.toString());
    formData.append('position', data.position.toString());
    formData.append('imageChanged', 'true'); // Siempre es true para creación
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }

    // Agregar archivo de imagen si existe
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post<Category>('/categories', formData);
    return response;
  }

  async updateCategory(id: string, data: CategoryFormData, imageFile?: File): Promise<Category> {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('slug', data.slug);
    formData.append('isActive', data.isActive.toString());
    formData.append('position', data.position.toString());
    formData.append('imageChanged', data.imageChanged ? 'true' : 'false');
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }

    // Agregar archivo de imagen si existe y ha cambiado
    if (data.imageChanged && imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.put<Category>(`/categories/${id}`, formData);
    return response;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export const categoriesService = new CategoriesService(); 