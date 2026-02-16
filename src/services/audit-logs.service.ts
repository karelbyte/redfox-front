import { api } from './api';
import { AuditLog, AuditAction } from '@/types/audit-log';

interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

class AuditLogsService {
  async getAll(
    page: number = 1,
    limit: number = 50,
    filters?: {
      entityType?: string;
      action?: AuditAction;
      userId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedAuditLogsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get(`/audit-logs?${params.toString()}`) as Promise<PaginatedAuditLogsResponse>;
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return api.get(
      `/audit-logs/entity/${entityType}/${entityId}?limit=${limit}`,
    ) as Promise<AuditLog[]>;
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return api.get(`/audit-logs/user?userId=${userId}&limit=${limit}`) as Promise<AuditLog[]>;
  }

  async findByAction(
    action: AuditAction,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return api.get(`/audit-logs/action/${action}?limit=${limit}`) as Promise<AuditLog[]>;
  }

  async getStats(entityType: string): Promise<any> {
    return api.get(`/audit-logs/stats/${entityType}`);
  }
}

export const auditLogsService = new AuditLogsService();
export type { AuditLog, PaginatedAuditLogsResponse };
export { AuditAction };
