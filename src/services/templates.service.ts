import { api } from './api';
import { Template, CreateTemplateDto, UpdateTemplateDto } from '@/types/template';

class TemplatesService {
  async create(
    name: string,
    entityType: string,
    data: Record<string, any>,
    description?: string,
    isDefault?: boolean,
  ): Promise<Template> {
    const dto: CreateTemplateDto = {
      name,
      entityType,
      data,
      description,
      isDefault,
    };
    return api.post('/templates', dto as any) as Promise<Template>;
  }

  async findByUser(entityType?: string): Promise<Template[]> {
    const params = entityType ? `?entityType=${entityType}` : '';
    return api.get(`/templates${params}`) as Promise<Template[]>;
  }

  async findDefault(entityType: string): Promise<Template | null> {
    try {
      return await api.get(`/templates/default/${entityType}`) as unknown as Template;
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<Template> {
    return api.get(`/templates/${id}`) as Promise<Template>;
  }

  async update(
    id: string,
    name?: string,
    data?: Record<string, any>,
    description?: string,
  ): Promise<Template> {
    const dto: UpdateTemplateDto = { name, data, description };
    return api.put(`/templates/${id}`, dto as any) as Promise<Template>;
  }

  async setAsDefault(id: string, entityType: string): Promise<void> {
    await api.post(`/templates/${id}/set-default?entityType=${entityType}`, {});
  }

  async duplicate(id: string, newName: string): Promise<Template> {
    return api.post(`/templates/${id}/duplicate?newName=${newName}`, {}) as Promise<Template>;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  }
}

export const templatesService = new TemplatesService();
export type { Template };
