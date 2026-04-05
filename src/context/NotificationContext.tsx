'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Notification, NotificationFilters } from '@/types/notification';
import { notificationService } from '@/services/notifications.service';
import { useAuth } from '@/context/AuthContext';
import { useToastNotificationStore, toastToNotification } from '@/stores/toast-notification.store';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  
  // Real-time
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications({
        limit: 20,
        ...filters,
      });
      setNotifications(response.data);
      setUnreadCount(response.meta.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  const isLocalNotification = (id: string) => id.startsWith('toast-');

  const markAsRead = useCallback(async (id: string) => {
    // Notificaciones locales (toast) — solo actualizar estado
    if (isLocalNotification(id)) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking notification as read');
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Marcar locales en estado
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      // Marcar en servidor solo las no-locales
      await notificationService.markAllAsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    // Notificaciones locales (toast) — solo eliminar del estado
    if (isLocalNotification(id)) {
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return;
    }
    try {
      await notificationService.deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notification');
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  const deleteAllRead = useCallback(async () => {
    try {
      // Eliminar locales del estado directamente
      setNotifications(prev => prev.filter(n => !n.isRead));
      // Eliminar del servidor solo las no-locales
      await notificationService.deleteAllRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting read notifications');
      console.error('Error deleting read notifications:', err);
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      if (prev.some(n => n.id === notification.id)) return prev;
      if (!notification.isRead) setUnreadCount(c => c + 1);
      return [notification, ...prev];
    });
  }, []);

  // Initial load and real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    refreshUnreadCount();

    // Subscribe to real-time notifications — pasamos los IDs ya conocidos para evitar duplicados
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      addNotification,
    );

    return unsubscribe;
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Consume toast notifications from the bridge store and add them to the bell
  const consume = useToastNotificationStore((s) => s.consume);
  useEffect(() => {
    const interval = setInterval(() => {
      const items = consume();
      items.forEach((item) => addNotification(toastToNotification(item)));
    }, 300);
    return () => clearInterval(interval);
  }, [consume, addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshUnreadCount,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};