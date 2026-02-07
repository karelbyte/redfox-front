import { api } from './api';

export interface InternalNote {
  id: string;
  content: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
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

export const internalNotesService = {
  create: async (dto: CreateInternalNoteDto): Promise<InternalNote> => {
    return api.post('/internal-notes', dto as any);
  },

  findByEntity: async (entityType: string, entityId: string): Promise<InternalNote[]> => {
    return api.get(`/internal-notes/${entityType}/${entityId}`);
  },

  update: async (id: string, dto: UpdateInternalNoteDto): Promise<InternalNote> => {
    return api.put(`/internal-notes/${id}`, dto as any);
  },

  remove: async (id: string): Promise<void> => {
    return api.delete(`/internal-notes/${id}`);
  },
};
