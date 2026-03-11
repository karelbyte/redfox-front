"use client";

import { useState, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom'; // Importa createPortal para el Portal real
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
  FloatingPortal, // Floating UI tiene su propio componente Portal
} from '@floating-ui/react'; // Importa desde Floating UI
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

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

  // Configuración de Floating UI para posicionamiento y comportamiento
  const { x, y, refs, strategy, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10), // Espacio entre el botón y el menú
      flip(), // Gira el menú si no cabe
      shift({ padding: 10 }), // Desplaza el menú si no cabe
    ],
    whileElementsMounted: autoUpdate, // Actualiza la posición automáticamente
  });

  // Configuración de interacciones (clic, descartar al hacer clic fuera)
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
    // No necesitamos clases de posicionamiento relativo aquí
    <div className="inline-block text-left">
      {/* Botón de referencia (el que abre el menú) */}
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        title={title || tCommon('actions.more')}
      >
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Menú flotante renderizado dentro de un Portal real */}
      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content', // Ajusta el ancho al contenido
              zIndex: 9999, // Asegura que esté por encima de todo
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
                    setIsOpen(false); // Cierra el menú al hacer clic en un elemento
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