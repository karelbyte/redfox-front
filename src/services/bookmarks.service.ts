import { api } from './api';
import { Bookmark, CreateBookmarkDto } from '@/types/bookmark';

class BookmarksService {
  async create(
    entityType: string,
    entityId: string,
    entityName?: string,
    description?: string,
  ): Promise<Bookmark> {
    const dto: CreateBookmarkDto = {
      entityType,
      entityId,
      entityName,
      description,
    };
    return api.post('/bookmarks', dto as any) as Promise<Bookmark>;
  }

  async findByUser(entityType?: string): Promise<Bookmark[]> {
    const params = entityType ? `?entityType=${entityType}` : '';
    return api.get(`/bookmarks${params}`) as Promise<Bookmark[]>;
  }

  async isBookmarked(entityType: string, entityId: string): Promise<boolean> {
    const response = await api.get(
      `/bookmarks/check/${entityType}/${entityId}`,
    );
    return (response as any).isBookmarked;
  }

  async remove(entityType: string, entityId: string): Promise<void> {
    await api.delete(`/bookmarks/${entityType}/${entityId}`);
  }
}

export const bookmarksService = new BookmarksService();
