"use client";

import { WarehouseCloseResponse } from "@/types/warehouse";

interface WarehouseCloseResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WarehouseCloseResponse | null;
}

export default function WarehouseCloseResultModal({
  isOpen,
  onClose,
  result,
}: WarehouseCloseResultModalProps) {
  if (!isOpen || !result) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Apertura Cerrada Exitosamente
              </h3>
              <div className="mt-2">
                <p className="text-sm text-green-800 font-medium mb-4">
                  {result.message}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Almacén:</span>
                    <span className="text-gray-900">{result.warehouseName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Productos transferidos:</span>
                    <span className="text-gray-900 font-semibold">{result.transferredProducts}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Cantidad total:</span>
                    <span className="text-gray-900 font-semibold">{result.totalQuantity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Fecha de cierre:</span>
                    <span className="text-gray-900">{formatDate(result.closedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 