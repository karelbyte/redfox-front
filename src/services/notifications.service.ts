import { api } from './api';
import { 
  Notification, 
  NotificationResponse, 
  CreateNotificationDto, 
  UpdateNotificationDto,
  NotificationFilters 
} from '@/types/notification';

class NotificationService {
  private baseUrl = '/notifications';

  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return api.get<NotificationResponse>(`${this.baseUrl}?${params.toString()}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>(`${this.baseUrl}/unread-count`);
    return response.count;
  }

  async getNotification(id: string): Promise<Notification> {
    return api.get<Notification>(`${this.baseUrl}/${id}`);
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    return api.post<Notification>(this.baseUrl, data as unknown as Record<string, unknown>);
  }

  async updateNotification(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return api.patch<Notification>(`${this.baseUrl}/${id}`, data as unknown as Record<string, unknown>);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.updateNotification(id, { isRead: true });
  }

  async markAllAsRead(): Promise<void> {
    await api.patch<void>(`${this.baseUrl}/mark-all-read`, {} as unknown as Record<string, unknown>);
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async deleteAllRead(): Promise<void> {
    await api.delete(`${this.baseUrl}/read`);
  }

  // Real-time subscription methods (for WebSocket integration)
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    // This would be implemented with WebSocket or Server-Sent Events
    // For now, we'll use polling as a fallback
    const interval = setInterval(async () => {
      try {
        const response = await this.getNotifications({ isRead: false, limit: 1 });
        if (response.data.length > 0) {
          callback(response.data[0]);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const notificationService = new NotificationService();