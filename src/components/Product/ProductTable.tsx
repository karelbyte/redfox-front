import { useTranslations } from 'next-intl';
import { Product } from '@/types/product';
import { PencilIcon, TrashIcon, QrCodeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import ActionsMenu, { ActionMenuItem } from "@/components/atoms/ActionsMenu";
import { usePermissions } from '@/hooks/usePermissions';
import { usePackCapabilities } from '@/hooks/usePackCapabilities';
import Tooltip from '@/components/atoms/Tooltip';
import { API_BASE_URL } from '@/lib/config';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onGenerateBarcode: (product: Product) => void;
  onSync?: (product: Product) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onGenerateBarcode,
  onSync,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: ProductTableProps) {
  const t = useTranslations('pages.products');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();

  if (!Array.isArray(products)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  return (
    <div
      data-testid="products-table"
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                checked={products.length > 0 && selectedIds.length === products.length}
                onChange={onSelectAllChange}
              />
            </th>
            {isVisible('name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.name')}
              </th>
            )}
            {isVisible('code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {isVisible('sku') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.sku')}
              </th>
            )}
            {isVisible('brand') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.brand')}
              </th>
            )}
            {isVisible('category') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.category')}
              </th>
            )}
            {isVisible('price') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.price')}
              </th>
            )}
            {isVisible('stock') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.stock')}
              </th>
            )}
            {isVisible('status') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.status')}
              </th>
            )}
            {isVisible('actions') && (
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(product.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                {selectedIds.includes(product.id) && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                )}
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => onSelectChange && onSelectChange(product.id)}
                />
              </td>
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`${API_BASE_URL}${product.images[0]}`}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-400">{product.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        {product.isSyncWithPack && (
                          <Tooltip content={t('table.inPack')} placement="right">
                            <CheckCircleIcon
                              className="h-4 w-4 shrink-0 text-green-600"
                              aria-label={t('table.inPack')}
                            />
                          </Tooltip>
                        )}
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </div>
                </td>
              )}
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.code}</td>
              )}
              {isVisible('sku') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
              )}
              {isVisible('brand') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.brand && typeof product.brand === 'object' ? product.brand.code : product.brand}
                </td>
              )}
              {isVisible('category') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category &&  typeof product.category === 'object' ? product.category.name : product.category}
                </td>
              )}
              {isVisible('price') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(product.base_price)}
                </td>
              )}
              {isVisible('stock') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center">
                    <span className={`${
                      (product.min_stock ?? 0) > 0 && Number(product.total_stock) <= Number(product.min_stock)
                        ? 'text-red-600 font-bold flex items-center gap-1'
                        : 'text-gray-900'
                    }`}>
                      {Number(product.total_stock || 0)}
                      {(product.min_stock ?? 0) > 0 && Number(product.total_stock) <= Number(product.min_stock) && (
                        <Tooltip content={t('table.lowStockWarning', { default: 'Stock bajo' })} placement="right">
                          <span>⚠️</span>
                        </Tooltip>
                      )}
                    </span>
                  </div>
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {product.is_active ? tCommon('status.active') : tCommon('status.inactive')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ProductActionsMenu
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onGenerateBarcode={onGenerateBarcode}
                    onSync={onSync}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProductActionsMenuProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onGenerateBarcode: (product: Product) => void;
  onSync?: (product: Product) => void;
}

function ProductActionsMenu({
  product,
  onEdit,
  onDelete,
  onGenerateBarcode,
  onSync,
}: ProductActionsMenuProps) {
  const t = useTranslations('pages.products');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  // Los PAC sin catálogo de productos (SUNAT) no tienen nada que sincronizar
  const { capabilities } = usePackCapabilities();

  const menuItems: ActionMenuItem[] = [
    ...(can(['product_update']) && onSync && capabilities.productCatalog
      ? [
          {
            icon: <ArrowPathIcon className="h-4 w-4" />,
            label: t('actions.syncWithPack') || 'Resincronizar con el PAC',
            color: '#0891b2',
            onClick: () => {
              onSync(product);
            },
          },
        ]
      : []),
    {
      icon: <QrCodeIcon className="h-4 w-4" />,
      label: t('actions.generateBarcode'),
      color: '#059669',
      onClick: () => {
        onGenerateBarcode(product);
      },
    },
    ...(can(['product_update'])
      ? [
          {
            icon: <PencilIcon className="h-4 w-4" />,
            label: tCommon('actions.edit'),
            onClick: () => {
              onEdit(product);
            },
          },
        ]
      : []),
    ...(can(['product_delete'])
      ? [
          {
            icon: <TrashIcon className="h-4 w-4" />,
            label: tCommon('actions.delete'),
            color: '#dc2626',
            onClick: () => {
              onDelete(product);
            },
          },
        ]
      : []),
  ];

  return <ActionsMenu items={menuItems} />;
}
