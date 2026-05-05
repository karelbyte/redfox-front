import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { Position } from '@/types/employee';

export const positionsService = {
  getPositions: async (
    page: number = 1,
    term?: string,
    limit: number = 10
  ): Promise<PaginatedResponse<Position>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }

    return await api.get<PaginatedResponse<Position>>(`/positions?${params.toString()}`);
  },

  getPosition: async (id: string): Promise<Position> => {
    return await api.get<Position>(`/positions/${id}`);
  },

  createPosition: async (data: Partial<Position>): Promise<Position> => {
    return await api.post<Position>('/positions', data as any);
  },

  updatePosition: async (id: string, data: Partial<Position>): Promise<Position> => {
    return await api.put<Position>(`/positions/${id}`, data as any);
  },

  deletePosition: async (id: string): Promise<void> => {
    await api.delete(`/positions/${id}`);
  },
};
