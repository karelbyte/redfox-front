'use client';

import { MeasurementUnit } from '@/types/measurement-unit';
import { api } from './api';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MeasurementUnitSuggestion {
  key: string;
  description: string;
  score?: number;
}

export const measurementUnitsService = {
  async getMeasurementUnits(page?: number, term?: string): Promise<PaginatedResponse<MeasurementUnit>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/measurement-units${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse<MeasurementUnit>>(url);
    return response;
  },

  async searchFromPack(term: string): Promise<MeasurementUnitSuggestion[]> {
    if (!term || term.trim().length === 0) {
      return [];
    }
    const response = await api.get<MeasurementUnitSuggestion[]>(`/measurement-units/search/from-pack?term=${encodeURIComponent(term.trim())}`);
    return response;
  },

  async createMeasurementUnit(data: Omit<MeasurementUnit, 'id' | 'created_at' | 'updated_at'>): Promise<MeasurementUnit> {
    const response = await api.post<MeasurementUnit>('/measurement-units', data);
    return response;
  },

  async updateMeasurementUnit(id: string, data: Partial<MeasurementUnit>): Promise<MeasurementUnit> {
    const response = await api.put<MeasurementUnit>(`/measurement-units/${id}`, data);
    return response;
  },

  async deleteMeasurementUnit(id: string): Promise<void> {
    await api.delete(`/measurement-units/${id}`);
  },
}; 