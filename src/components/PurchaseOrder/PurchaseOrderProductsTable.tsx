'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrderDetail } from '@/types/purchase-order';
import { Btn } from '@/components/atoms';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PurchaseOrderProductsTableProps {
  products: PurchaseOrderDetail[];
  onEdit: (product: PurchaseOrderDetail) => void;
  onDelete: (product: PurchaseOrderDetail) => void;
}

export default function PurchaseOrderProductsTable({ 
  products, 
  onEdit, 
  onDelete 
}: PurchaseOrderProductsTableProps) {
  const t = useTranslations('pages.purchaseOrders');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('products.noProducts')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('products.noProductsDesc')}</p>
      </div>
    );
  }

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
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.product')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.sku')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.brand')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.category')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.quantity')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.price')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.subtotal')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('products.headers.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {product.product.images && product.product.images.length > 0 ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.product.images[0]}
                        alt={product.product.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {product.product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.product.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.brand.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.product.category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(product.quantity * product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={t('products.actions.edit')}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={t('products.actions.delete')}
                    style={{ color: '#dc2626' }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 