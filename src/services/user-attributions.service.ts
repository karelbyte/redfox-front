import { api } from './api';

export interface UserAttribution {
  id: string;
  userId: string;
  attributionType: 'WAREHOUSE' | 'STORE' | 'CATEGORY' | 'CASH_REGISTER';
  resourceId: string;
  resourceType: string;
  permissions: Record<string, boolean> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignAttributionsDto {
  userId: string;
  attributionType: 'WAREHOUSE' | 'STORE' | 'CATEGORY' | 'CASH_REGISTER';
  resourceIds: string[];
  resourceType: string;
  permissions?: Record<string, boolean>;
}

class UserAttributionsService {
  async getUserAttributions(
    userId: string,
    attributionType?: string,
  ): Promise<UserAttribution[]> {
    const params = attributionType ? `?attributionType=${attributionType}` : '';
    const response = await api.get<UserAttribution[]>(
      `/user-attributions/user/${userId}${params}`,
    );
    return response;
  }

  async assignAttributions(
    data: AssignAttributionsDto,
  ): Promise<UserAttribution[]> {
    const response = await api.post<UserAttribution[]>(
      '/user-attributions/assign',
      data as unknown as Record<string, unknown>,
    );
    return response;
  }

  async createAttribution(
    data: Partial<UserAttribution>,
  ): Promise<UserAttribution> {
    const response = await api.post<UserAttribution>('/user-attributions', data);
    return response;
  }

  async updateAttribution(
    id: string,
    data: Partial<UserAttribution>,
  ): Promise<UserAttribution> {
    const response = await api.put<UserAttribution>(
      `/user-attributions/${id}`,
      data,
    );
    return response;
  }

  async deleteAttribution(id: string): Promise<void> {
    await api.delete(`/user-attributions/${id}`);
  }
}

export const userAttributionsService = new UserAttributionsService();
