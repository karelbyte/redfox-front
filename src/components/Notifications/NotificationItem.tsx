'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { Notification, NotificationType, NotificationPriority } from '@/types/notification';
import { 
  CheckIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  ShoppingCartIcon,
  CubeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case NotificationType.ERROR:
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case NotificationType.WARNING:
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case NotificationType.SYSTEM:
        return <CogIcon className={`${iconClass} text-blue-500`} />;
      case NotificationType.ORDER:
        return <ShoppingCartIcon className={`${iconClass} text-purple-500`} />;
      case NotificationType.INVENTORY:
        return <CubeIcon className={`${iconClass} text-orange-500`} />;
      case NotificationType.SALE:
        return <BanknotesIcon className={`${iconClass} text-green-600`} />;
      case NotificationType.QUOTATION:
        return <DocumentTextIcon className={`${iconClass} text-indigo-500`} />;
      case NotificationType.INVOICE:
        return <ReceiptPercentIcon className={`${iconClass} text-pink-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'border-l-red-500';
      case NotificationPriority.HIGH:
        return 'border-l-orange-500';
      case NotificationPriority.MEDIUM:
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'es' ? es : enUS,
    });
  };

  return (
    <div
      className={`p-4 border-l-4 transition-colors cursor-pointer hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50' : 'bg-white'
      } ${getPriorityColor(notification.priority)}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p 
                className={`text-sm font-medium ${
                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {notification.title}
              </p>
              <p 
                className={`mt-1 text-sm ${
                  !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                }`}
              >
                {notification.message}
              </p>
              
              {/* Action button */}
              {notification.actionUrl && notification.actionLabel && (
                <button
                  className="mt-2 text-xs font-medium transition-colors hover:underline"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {notification.actionLabel}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={t('actions.markAsRead')}
                >
                  <CheckIcon className="h-4 w-4 text-gray-500" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-red-100 transition-colors"
                title={t('actions.delete')}
              >
                <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Timestamp and type */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatTime(notification.createdAt)}
            </span>
            
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `rgb(var(--color-primary-100))`,
                color: `rgb(var(--color-primary-700))`
              }}
            >
              {t(`types.${notification.type}`)}
            </span>
          </div>

          {/* Priority indicator */}
          {notification.priority !== NotificationPriority.LOW && (
            <div className="mt-2">
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  notification.priority === NotificationPriority.URGENT
                    ? 'bg-red-100 text-red-800'
                    : notification.priority === NotificationPriority.HIGH
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {t(`priority.${notification.priority}`)}
              </span>
            </div>
          )}
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div 
            className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
            style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationItem;