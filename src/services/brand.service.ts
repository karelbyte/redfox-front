import { api } from './api';
import { Brand, BrandFormData } from '@/types/brand';
import { toastService } from './toast.service';

interface PaginatedResponse {
  data: Brand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class BrandService {
  async getBrands(page: number = 1): Promise<PaginatedResponse> {
    const response = await api.get<PaginatedResponse>(`/brands?page=${page}`);
    return response;
  }

  async createBrand(data: BrandFormData, imageFile?: File): Promise<Brand> {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('code', data.code);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive.toString());
    formData.append('imageChanged', 'true'); // Siempre es true para creación

    // Agregar archivo de imagen si existe
    if (imageFile) {
      formData.append('img', imageFile);
    }

    const response = await api.post<Brand>('/brands', formData);
    toastService.success('Marca creada exitosamente');
    return response;
  }

  async updateBrand(id: string, data: BrandFormData, imageFile?: File): Promise<Brand> {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('code', data.code);
    formData.append('description', data.description);
    formData.append('isActive', data.isActive.toString());
    formData.append('imageChanged', data.imageChanged ? 'true' : 'false');

    // Agregar archivo de imagen si existe y ha cambiado
    if (data.imageChanged && imageFile) {
      formData.append('img', imageFile);
    }

    const response = await api.put<Brand>(`/brands/${id}`, formData);
    toastService.success('Marca actualizada exitosamente');
    return response;
  }

  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/brands/${id}`);
    toastService.success('Marca eliminada exitosamente');
  }

  async getBrandById(id: string): Promise<Brand> {
    const response = await api.get<Brand>(`/brands/${id}`);
    return response;
  }
}

export const brandService = new BrandService(); 