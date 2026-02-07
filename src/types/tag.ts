export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  entityType: string;
  created_at: string;
}

export interface CreateTagDto {
  name: string;
  entityType: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}
