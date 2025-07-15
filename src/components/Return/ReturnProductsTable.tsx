'use client';

import { useTranslations } from 'next-intl';
import { ReturnDetail } from '@/types/return';
import { Btn } from '@/components/atoms';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ReturnProductsTableProps {
  products: ReturnDetail[];
  onDeleteProduct: (detailId: string) => void;
  onEditProduct: (product: ReturnDetail) => void;
  isReturnOpen: boolean;
}

export default function ReturnProductsTable({
  products,
  onDeleteProduct,
  onEditProduct,
  isReturnOpen,
}: ReturnProductsTableProps) {
  const t = useTranslations('pages.returns.products');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg font-medium">{t('noProducts')}</p>
          <p className="text-sm mt-2">
            {isReturnOpen ? t('noProductsDesc') : t('noProductsClosedDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.product')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.sku')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.brand')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.category')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.quantity')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.price')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('headers.subtotal')}
            </th>
            {isReturnOpen && (
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('headers.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.product.name}</div>
                <div className="text-sm text-gray-500">{product.product.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.brand?.name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.category?.name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="font-medium">{product.quantity}</span>
                <span className="text-gray-500 ml-1">
                  {product.product.measurement_unit?.code || 'pz'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {formatPrice(product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {formatPrice(product.quantity * product.price)}
              </td>
              {isReturnOpen && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProduct(product)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={t('actions.edit')}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={t('actions.delete')}
                      style={{ color: '#dc2626' }}
                    />
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