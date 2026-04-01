'use client';

import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from '@floating-ui/react';
import { useRef, useState } from 'react';
import type { Placement } from '@floating-ui/react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: Placement;
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 6 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { delay: { open: delay, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  if (!content) return children;

  // Calcular posición de la flecha
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const staticSide =
    placement.startsWith('top') ? 'bottom' :
    placement.startsWith('bottom') ? 'top' :
    placement.startsWith('left') ? 'right' : 'left';

  return (
    <>
      {/* Clonar el hijo para inyectar ref y props sin usar element.ref */}
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>

      <FloatingPortal>
        {open && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-md shadow-md pointer-events-none select-none max-w-xs"
          >
            {content}
            {/* Flecha */}
            <div
              ref={arrowRef}
              className="absolute w-2 h-2 bg-gray-800 rotate-45"
              style={{
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
                [staticSide]: '-4px',
              }}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}
