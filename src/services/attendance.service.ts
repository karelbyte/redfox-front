import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { Attendance } from '@/types/employee';

export const attendanceService = {
  getAttendance: async (
    page: number = 1,
    term?: string,
    limit: number = 10
  ): Promise<PaginatedResponse<Attendance>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }

    return await api.get<PaginatedResponse<Attendance>>(`/attendance?${params.toString()}`);
  },

  getAttendanceRecord: async (id: string): Promise<Attendance> => {
    return await api.get<Attendance>(`/attendance/${id}`);
  },

  createAttendance: async (data: Partial<Attendance>): Promise<Attendance> => {
    return await api.post<Attendance>('/attendance', data as any);
  },

  clockIn: async (data: Partial<Attendance>): Promise<Attendance> => {
    return await api.post<Attendance>('/attendance/clock-in', data as any);
  },

  clockOut: async (id: string, data: Partial<Attendance>): Promise<Attendance> => {
    return await api.put<Attendance>(`/attendance/clock-out/${id}`, data as any);
  },

  updateAttendance: async (id: string, data: Partial<Attendance>): Promise<Attendance> => {
    return await api.put<Attendance>(`/attendance/${id}`, data as any);
  },

  deleteAttendance: async (id: string): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },
};
