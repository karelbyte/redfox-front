export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  ORDER = 'order',
  INVENTORY = 'inventory',
  SALE = 'sale',
  QUOTATION = 'quotation',
  INVOICE = 'invoice',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
  };
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  userId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  page?: number;
  limit?: number;
}