import { XMarkIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";

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
  width = "max-w-md",
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full ${width} bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className={`flex items-center p-2 border-b ${
              onSave ? "justify-between" : "justify-start"
            }`}
            style={{ borderColor: `rgb(var(--color-primary-100))` }}
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
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
