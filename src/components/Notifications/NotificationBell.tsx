'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '@/context/NotificationContext';
import { useLocale } from 'next-intl';
import NotificationDropdown from './NotificationDropdown';
import Tooltip from '@/components/atoms/Tooltip';

const NotificationBell: React.FC = () => {
  const { unreadCount, notifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Solo pulsa si hay errores sin leer
  const hasUnreadErrors = notifications.some(
    n => !n.isRead && n.type === 'error'
  );

  const tooltipText = locale === 'en'
    ? `Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`
    : `Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellRef.current &&
        dropdownRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative mt-2">
      <Tooltip content={tooltipText} placement="bottom">
        <button
          ref={bellRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ '--tw-ring-color': `rgb(var(--color-primary-500))` } as React.CSSProperties}
          aria-label={tooltipText}
        >
          {unreadCount > 0 ? (
            <BellSolidIcon className="h-6 w-6" style={{ color: `rgb(var(--color-primary-600))` }} />
          ) : (
            <BellIcon className="h-6 w-6 text-gray-600" />
          )}

          {unreadCount > 0 && (
            <>
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full min-w-[1.25rem] h-5"
                style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span
                className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: `rgb(var(--color-primary-400))`, display: hasUnreadErrors ? undefined : 'none' }}
              />
            </>
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div ref={dropdownRef}>
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
