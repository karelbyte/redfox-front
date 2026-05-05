import { api } from './api';
import { PaginatedResponse } from '@/types/api';
import { LeaveRequest } from '@/types/employee';

export const leaveRequestsService = {
  getLeaveRequests: async (
    page: number = 1,
    term?: string,
    limit: number = 10
  ): Promise<PaginatedResponse<LeaveRequest>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (term) {
      params.append('term', term);
    }

    return await api.get<PaginatedResponse<LeaveRequest>>(`/leave-requests?${params.toString()}`);
  },

  getLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    return await api.get<LeaveRequest>(`/leave-requests/${id}`);
  },

  createLeaveRequest: async (data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    return await api.post<LeaveRequest>('/leave-requests', data as any);
  },

  updateLeaveRequest: async (id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    return await api.put<LeaveRequest>(`/leave-requests/${id}`, data as any);
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    return await api.post<LeaveRequest>(`/leave-requests/${id}/approve`, {});
  },

  rejectLeaveRequest: async (id: string, reason: string): Promise<LeaveRequest> => {
    return await api.post<LeaveRequest>(`/leave-requests/${id}/reject`, { reason });
  },

  deleteLeaveRequest: async (id: string): Promise<void> => {
    await api.delete(`/leave-requests/${id}`);
  },
};
