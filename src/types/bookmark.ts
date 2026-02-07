export interface Bookmark {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  description?: string;
  created_at: string;
}

export interface CreateBookmarkDto {
  entityType: string;
  entityId: string;
  entityName?: string;
  description?: string;
}
