import { InventoryItem } from '@/types/inventory';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  currencyCode: string;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  item,
  currencyCode,
}: ProductDetailsModalProps) {
  if (!isOpen || !item) return null;

  const { product } = item;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Detalles del Producto
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Información Básica</h4>
                  <div className="mt-1 text-sm text-gray-500">
                    <p><span className="font-medium">Nombre:</span> {product.name}</p>
                    <p><span className="font-medium">SKU:</span> {product.sku}</p>
                    <p><span className="font-medium">Descripción:</span> {product.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Información del Inventario</h4>
                  <div className="mt-1 text-sm text-gray-500">
                    <p><span className="font-medium">Cantidad:</span> {item.quantity}</p>
                    <p><span className="font-medium">Precio:</span> {currencyCode} {formatPrice(item.price)}</p>
                    <p><span className="font-medium">Fecha:</span> {formatDate(item.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 