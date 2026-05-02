"use client";

import { useState, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  FloatingPortal,
} from '@floating-ui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import Tooltip from './Tooltip';

export interface ActionMenuItem {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onClick: () => void;
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
  title?: string;
}

export default function ActionsMenu({ items, title }: ActionsMenuProps) {
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, refs, strategy, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 10 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="inline-block text-left">
      <Tooltip content={title || tCommon('actions.more')} placement="top">
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </Tooltip>

      {/* Menú flotante renderizado dentro de un Portal real */}
      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
              zIndex: 9999,
            }}
            {...getFloatingProps()}
            className="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 overflow-hidden"
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors group"
                >
                  <span
                    style={{ color: item.color || 'currentColor' }}
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="truncate group-hover:text-gray-900">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </FloatingPortal>
    </div>
  );
}