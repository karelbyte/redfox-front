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

export const measurementUnitsService = {
  async getMeasurementUnits(page: number = 1): Promise<PaginatedResponse<MeasurementUnit>> {
    const response = await api.get<PaginatedResponse<MeasurementUnit>>(`/measurement-units?page=${page}`);
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