import { useTranslations } from 'next-intl';
import { Product } from '@/types/product';
import { PencilIcon, TrashIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onGenerateBarcode: (product: Product) => void;
  visibleColumns?: string[];
}

export default function ProductTable({ products, onEdit, onDelete, onGenerateBarcode, visibleColumns }: ProductTableProps) {
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
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
            <tr key={product.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </span>
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
                  {typeof product.brand === 'object' ? product.brand.code : product.brand}
                </td>
              )}
              {isVisible('category') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof product.category === 'object' ? product.category.name : product.category}
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
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onGenerateBarcode(product)}
                      leftIcon={<QrCodeIcon className="h-4 w-4" />}
                      title={t('actions.generateBarcode')}
                      style={{ color: '#059669' }}
                    />
                    {can(["product_update"]) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={tCommon('actions.edit')}
                      />
                    )}
                    {can(["product_delete"]) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={tCommon('actions.delete')}
                        style={{ color: '#dc2626' }}
                      />
                    )}

                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
