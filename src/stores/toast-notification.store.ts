import { create } from 'zustand';
import { NotificationType, NotificationPriority, Notification } from '@/types/notification';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
}

interface ToastNotificationStore {
  pending: ToastNotification[];
  push: (n: ToastNotification) => void;
  consume: () => ToastNotification[];
}

export const useToastNotificationStore = create<ToastNotificationStore>((set, get) => ({
  pending: [],
  push: (n) => set((s) => ({ pending: [...s.pending, n] })),
  consume: () => {
    const items = get().pending;
    set({ pending: [] });
    return items;
  },
}));

export function toastToNotification(t: ToastNotification): Notification {
  return {
    id: t.id,
    title: t.title,
    message: t.message,
    type: t.type,
    priority: t.priority,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'local',
  };
}
