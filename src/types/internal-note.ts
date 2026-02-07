export interface InternalNote {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  content: string;
  color?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateInternalNoteDto {
  entityType: string;
  entityId: string;
  content: string;
  color?: string;
}

export interface UpdateInternalNoteDto {
  content?: string;
  color?: string;
}
