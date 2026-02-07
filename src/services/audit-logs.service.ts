import { api } from './api';
import { AuditLog, AuditAction } from '@/types/audit-log';

class AuditLogsService {
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
export type { AuditLog };
export { AuditAction };
