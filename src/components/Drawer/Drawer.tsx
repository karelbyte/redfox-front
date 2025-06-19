"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// Contexto para manejar drawers anidados
interface DrawerContextType {
  openDrawer: (id: string, parentId?: string) => void;
  closeDrawer: (id: string) => void;
  isDrawerOpen: (id: string) => boolean;
  getDrawerStack: () => string[];
  getParentId: (id: string) => string | undefined;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within a DrawerProvider');
  }
  return context;
};

interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [drawerStack, setDrawerStack] = useState<string[]>([]);
  const [drawerParents, setDrawerParents] = useState<Map<string, string>>(new Map());

  const openDrawer = useCallback((id: string, parentId?: string) => {
    setDrawerStack(prev => [...prev, id]);
    if (parentId) {
      setDrawerParents(prev => new Map(prev).set(id, parentId));
    }
  }, []);

  const closeDrawer = useCallback((id: string) => {
    setDrawerStack(prev => prev.filter(drawerId => drawerId !== id));
    setDrawerParents(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const isDrawerOpen = useCallback((id: string) => drawerStack.includes(id), [drawerStack]);

  const getDrawerStack = useCallback(() => drawerStack, [drawerStack]);

  const getParentId = useCallback((id: string) => drawerParents.get(id), [drawerParents]);

  return (
    <DrawerContext.Provider value={{
      openDrawer,
      closeDrawer,
      isDrawerOpen,
      getDrawerStack,
      getParentId,
    }}>
      {children}
    </DrawerContext.Provider>
  );
};

interface DrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  isFormValid?: boolean;
  width?: string;
  parentId?: string;
}

export default function Drawer({
  id,
  isOpen,
  onClose,
  title,
  children,
  onSave,
  isSaving = false,
  isFormValid = true,
  width = "max-w-md",
  parentId,
}: DrawerProps) {
  const { openDrawer, closeDrawer, isDrawerOpen, getDrawerStack, getParentId } = useDrawerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChildOpen, setHasChildOpen] = useState(false);

  // Registrar el drawer cuando se abre
  useEffect(() => {
    if (isOpen) {
      openDrawer(id, parentId);
    } else {
      closeDrawer(id);
    }
  }, [isOpen, id, parentId, openDrawer, closeDrawer]);

  // Verificar si este drawer tiene un hijo abierto
  useEffect(() => {
    const stack = getDrawerStack();
    const hasChild = stack.some(drawerId => getParentId(drawerId) === id);
    setHasChildOpen(hasChild);
  }, [getDrawerStack, getParentId, id]);

  // Verificar si este drawer es hijo de otro
  useEffect(() => {
    const parentId = getParentId(id);
    const isChild = !!parentId;
    setIsExpanded(isChild);
  }, [getParentId, id]);

  if (!isOpen) return null;

  // Calcular estilos dinámicos
  const getDrawerStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      right: 0,
      top: 0,
      height: '100%',
      width: '100%',
      backgroundColor: 'white',
      boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      zIndex: 50,
      transform: 'translateX(0)',
      transition: 'all 0.3s ease-in-out',
    };

    const stack = getDrawerStack();
    const hasMultipleDrawers = stack.length > 1;

    // Si solo hay un drawer abierto, comportamiento normal
    if (!hasMultipleDrawers) {
      return baseStyles;
    }

    // Si es un drawer hijo, se posiciona a la derecha sin cortarse
    if (isExpanded) {
      return {
        ...baseStyles,
        right: '-10%', // Se mueve hacia la derecha para no cortarse
        zIndex: 60,
        boxShadow: '0 0 30px rgba(0,0,0,0.4)',
      };
    }

    // Si es un drawer principal y tiene un hijo abierto, se expande y se mueve a la izquierda
    if (!isExpanded && hasChildOpen) {
      return {
        ...baseStyles,
        width: '120%',
        transform: 'translateX(-10%)',
        zIndex: 40,
      };
    }

    return baseStyles;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Drawer */}
      <div
        className={`${width} bg-white`}
        style={getDrawerStyles()}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className={`flex items-center p-2 border-b ${
              onSave ? "justify-between" : "justify-start"
            }`}
            style={{ 
              borderColor: `rgb(var(--color-primary-100))`,
              backgroundColor: 'white',
            }}
          >
            <button
              onClick={onClose}
              className="p-2 text-gray-600 transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = `rgb(var(--color-primary-600))`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#4b5563";
              }}
              title="Cerrar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2
              className="text-lg font-semibold"
              style={{ color: `rgb(var(--color-primary-800))` }}
            >
              {title}
            </h2>
            {onSave && (
              <Btn
                onClick={onSave}
                disabled={isSaving || !isFormValid}
                loading={isSaving}
                size="sm"
              >
                Guardar
              </Btn>
            )}
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{
              backgroundColor: 'white',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
