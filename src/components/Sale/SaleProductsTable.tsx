'use client'

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { SaleDetail } from '@/types/sale';
import { Btn } from '@/components/atoms';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface SaleProductsTableProps {
  products: SaleDetail[];
  onDeleteProduct: (detailId: string) => Promise<void>;
  onEditProduct: (product: SaleDetail) => void;
  isSaleOpen: boolean;
}

export default function SaleProductsTable({ 
  products, 
  onDeleteProduct, 
  onEditProduct,
  isSaleOpen 
}: SaleProductsTableProps) {
  const t = useTranslations('pages.sales.productsTable');
  const deleteT = useTranslations('pages.sales.deleteProduct');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<SaleDetail | null>(null);

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = currencyCode || 'MXN';
    const localeStr = code === 'MXN' ? 'es-MX' : locale === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(localeStr, {
      style: 'currency',
      currency: code,
    }).format(amount);
  };

  const calcTaxAmount = (detail: SaleDetail): number => {
    const subtotal = Number(detail.quantity) * Number(detail.price);
    const taxRate = (detail.product.taxes || []).reduce((acc, tax) => {
      if (tax.type === 'PERCENTAGE') return acc + Number(tax.value) / 100;
      return acc;
    }, 0);
    return subtotal * taxRate;
  };

  const calcTotal = (detail: SaleDetail): number => {
    const subtotal = Number(detail.quantity) * Number(detail.price);
    return subtotal + calcTaxAmount(detail);
  };

  const grandSubtotal = products.reduce((s, d) => s + Number(d.quantity) * Number(d.price), 0);
  const grandTax = products.reduce((s, d) => s + calcTaxAmount(d), 0);
  const grandTotal = grandSubtotal + grandTax;
  const currencyCode = products[0]?.product.currency?.code || 'MXN';

  const handleDeleteClick = (product: SaleDetail) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (product: SaleDetail) => {
    onEditProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await onDeleteProduct(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-12">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noProducts')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isSaleOpen 
            ? t('noProductsDesc')
            : t('noProductsCompletedDesc')
          }
        </p>
      </div>
    );
  }

  return (
    <>
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
                {t('headers.product')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('headers.quantity')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('headers.price')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('headers.subtotal')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('headers.tax')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('headers.total')}
              </th>
              {isSaleOpen && (
                <th 
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: `rgb(var(--color-primary-600))` }}
                >
                  {t('headers.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((detail) => (
              <tr key={detail.id} className="hover:bg-primary-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {detail.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {detail.product.sku}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {detail.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(detail.price, detail.product.currency?.code)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(detail.quantity * detail.price, detail.product.currency?.code)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calcTaxAmount(detail) > 0
                    ? formatCurrency(calcTaxAmount(detail), detail.product.currency?.code)
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: 'rgb(var(--color-primary-700))' }}>
                  {formatCurrency(calcTotal(detail), detail.product.currency?.code)}
                </td>
                {isSaleOpen && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(detail)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={commonT('actions.edit')}
                      />
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(detail)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={commonT('actions.delete')}
                        style={{ color: '#dc2626' }}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colSpan={isSaleOpen ? 3 : 3} className="px-6 py-3 text-sm font-medium text-gray-500 text-right">
                {t('summary.subtotal')}
              </td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                {formatCurrency(grandSubtotal, currencyCode)}
              </td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                {grandTax > 0 ? formatCurrency(grandTax, currencyCode) : '—'}
              </td>
              <td className="px-6 py-3 text-sm font-bold" style={{ color: 'rgb(var(--color-primary-700))' }}>
                {formatCurrency(grandTotal, currencyCode)}
              </td>
              {isSaleOpen && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={deleteT('title')}
        message={deleteT('message', { 
          productName: productToDelete?.product.name || '' 
        })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
} 