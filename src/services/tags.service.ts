import { api } from './api';
import { Tag, CreateTagDto, UpdateTagDto } from '@/types/tag';

class TagsService {
  async create(
    name: string,
    entityType: string,
    color?: string,
  ): Promise<Tag> {
    const dto: CreateTagDto = { name, entityType, color };
    return api.post('/tags', dto as any) as Promise<Tag>;
  }

  async findByUser(entityType?: string): Promise<Tag[]> {
    const params = entityType ? `?entityType=${entityType}` : '';
    return api.get(`/tags${params}`) as Promise<Tag[]>;
  }

  async search(entityType: string, term: string = ''): Promise<Tag[]> {
    return api.get(`/tags/search/${entityType}?term=${term}`) as Promise<Tag[]>;
  }

  async findById(id: string): Promise<Tag> {
    return api.get(`/tags/${id}`) as Promise<Tag>;
  }

  async update(id: string, name?: string, color?: string): Promise<Tag> {
    const dto: UpdateTagDto = { name, color };
    return api.put(`/tags/${id}`, dto as any) as Promise<Tag>;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  }
}

export const tagsService = new TagsService();
export type { Tag };
