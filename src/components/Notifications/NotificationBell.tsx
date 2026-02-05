'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '@/context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          '--tw-ring-color': `rgb(var(--color-primary-500))`,
        } as React.CSSProperties}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon 
            className="h-6 w-6" 
            style={{ color: `rgb(var(--color-primary-600))` }}
          />
        ) : (
          <BellIcon 
            className="h-6 w-6 text-gray-600" 
          />
        )}
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full min-w-[1.25rem] h-5"
            style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: `rgb(var(--color-primary-400))` }}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef}>
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;