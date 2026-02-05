'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/context/NotificationContext';
import NotificationItem from './NotificationItem';
import { NotificationFilters, NotificationType } from '@/types/notification';
import { 
  CheckIcon, 
  TrashIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Loading from '@/components/Loading/Loading';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const t = useTranslations('notifications');
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    deleteAllRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = async (filter: 'all' | 'unread' | NotificationType) => {
    setActiveFilter(filter);
    
    const filters: NotificationFilters = {};
    if (filter === 'unread') {
      filters.isRead = false;
    } else if (filter !== 'all') {
      filters.type = filter as NotificationType;
    }
    
    await fetchNotifications(filters);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    if (activeFilter === 'unread') {
      await fetchNotifications({ isRead: false });
    }
  };

  const handleDeleteAllRead = async () => {
    await deleteAllRead();
    await fetchNotifications();
  };

  const filteredNotifications = notifications.slice(0, 10); // Show max 10 in dropdown

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50"
      style={{ borderColor: `rgb(var(--color-primary-200))` }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: `rgb(var(--color-primary-100))` }}
      >
        <div className="flex items-center space-x-2">
          <h3 
            className="text-lg font-semibold"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t('title')}
          </h3>
          {unreadCount > 0 && (
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title={t('filtersLabel')}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
          </button>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title={t('close')}
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div 
          className="p-3 border-b bg-gray-50"
          style={{ borderColor: `rgb(var(--color-primary-100))` }}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'text-white'
                  : 'text-gray-600 bg-white hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeFilter === 'all' ? `rgb(var(--color-primary-600))` : undefined,
              }}
            >
              {t('filters.all')}
            </button>
            
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'unread'
                  ? 'text-white'
                  : 'text-gray-600 bg-white hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeFilter === 'unread' ? `rgb(var(--color-primary-600))` : undefined,
              }}
            >
              {t('filters.unread')}
            </button>

            <button
              onClick={() => handleFilterChange(NotificationType.SYSTEM)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === NotificationType.SYSTEM
                  ? 'text-white'
                  : 'text-gray-600 bg-white hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeFilter === NotificationType.SYSTEM ? `rgb(var(--color-primary-600))` : undefined,
              }}
            >
              {t('types.system')}
            </button>

            <button
              onClick={() => handleFilterChange(NotificationType.ORDER)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === NotificationType.ORDER
                  ? 'text-white'
                  : 'text-gray-600 bg-white hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeFilter === NotificationType.ORDER ? `rgb(var(--color-primary-600))` : undefined,
              }}
            >
              {t('types.order')}
            </button>

            <button
              onClick={() => handleFilterChange(NotificationType.INVENTORY)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === NotificationType.INVENTORY
                  ? 'text-white'
                  : 'text-gray-600 bg-white hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeFilter === NotificationType.INVENTORY ? `rgb(var(--color-primary-600))` : undefined,
              }}
            >
              {t('types.inventory')}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {(unreadCount > 0 || notifications.some(n => n.isRead)) && (
        <div 
          className="flex items-center justify-between p-3 border-b bg-gray-50"
          style={{ borderColor: `rgb(var(--color-primary-100))` }}
        >
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-3 py-1 rounded text-sm font-medium transition-colors hover:bg-gray-200"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              <CheckIcon className="h-4 w-4" />
              <span>{t('actions.markAllRead')}</span>
            </button>
          )}
          
          {notifications.some(n => n.isRead) && (
            <button
              onClick={handleDeleteAllRead}
              className="flex items-center space-x-2 px-3 py-1 rounded text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{t('actions.deleteAllRead')}</span>
            </button>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loading size="md" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div 
            className="divide-y divide-gray-200"
            style={{ 
              '--tw-divide-opacity': '1',
              '--tw-divide-color': `rgb(var(--color-primary-100))`,
            } as React.CSSProperties}
          >
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 10 && (
        <div 
          className="p-3 border-t text-center"
          style={{ borderColor: `rgb(var(--color-primary-100))` }}
        >
          <button
            onClick={() => {
              // Navigate to full notifications page
              onClose();
            }}
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: `rgb(var(--color-primary-600))` }}
          >
            {t('viewAll')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;