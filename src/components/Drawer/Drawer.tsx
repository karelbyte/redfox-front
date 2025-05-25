import { XMarkIcon } from '@heroicons/react/24/outline';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSave,
  isSaving = false 
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-red-100">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Cerrar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-red-900">{title}</h2>
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
} 