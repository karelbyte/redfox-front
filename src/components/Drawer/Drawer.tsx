import { XMarkIcon } from '@heroicons/react/24/outline';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  isFormValid?: boolean;
  width?: string;
}

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSave,
  isSaving = false,
  isFormValid = true,
  width = 'max-w-md'
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
      <div className={`fixed right-0 top-0 h-full w-full ${width} bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`flex items-center p-2 border-b border-red-100 ${onSave ? 'justify-between' : 'justify-start'}`}>
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
                disabled={isSaving || !isFormValid}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
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