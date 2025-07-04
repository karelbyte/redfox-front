'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WarehouseAdjustmentDetail } from '@/types/warehouse-adjustment';
import Pagination from '@/components/Pagination/Pagination';
import { Btn, Input } from '@/components/atoms';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WarehouseAdjustmentProductsTableProps {
  products: WarehouseAdjustmentDetail[];
  onUpdate: (detailId: string, data: any) => void;
  onDelete: (detailId: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  adjustmentStatus: boolean;
}

export function WarehouseAdjustmentProductsTable({
  products,
  onUpdate,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  adjustmentStatus,
}: WarehouseAdjustmentProductsTableProps) {
  const t = useTranslations('pages.warehouseAdjustments');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ quantity: number; price: number }>({
    quantity: 0,
    price: 0,
  });

  const handleEditClick = (product: WarehouseAdjustmentDetail) => {
    setEditingId(product.id);
    setEditData({
      quantity: product.quantity,
      price: product.price,
    });
  };

  const handleSaveEdit = (detailId: string) => {
    onUpdate(detailId, {
      productId: products.find(p => p.id === detailId)?.product.id,
      quantity: editData.quantity,
      price: editData.price,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.table.product')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.table.sku')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.table.quantity')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.table.price')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('products.table.total')}
              </th>
              {!adjustmentStatus && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.table.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.product.name}</div>
                    <div className="text-sm text-gray-500">{product.product.brand.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editData.quantity}
                      onChange={(e) => setEditData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-20"
                    />
                  ) : (
                    product.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.price}
                      onChange={(e) => setEditData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-24"
                    />
                  ) : (
                    formatCurrency(product.price)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.quantity * product.price)}
                </td>
                {!adjustmentStatus && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === product.id ? (
                      <div className="flex space-x-2">
                        <Btn
                          onClick={() => handleSaveEdit(product.id)}
                          variant="success"
                          size="xs"
                          leftIcon={<CheckIcon className="w-3 h-3" />}
                        >
                          {t('actions.save')}
                        </Btn>
                        <Btn
                          onClick={handleCancelEdit}
                          variant="secondary"
                          size="xs"
                          leftIcon={<XMarkIcon className="w-3 h-3" />}
                        >
                          {t('actions.cancel')}
                        </Btn>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Btn
                          onClick={() => handleEditClick(product)}
                          variant="primary"
                          size="xs"
                          leftIcon={<PencilIcon className="w-3 h-3" />}
                        >
                          {t('actions.edit')}
                        </Btn>
                        <Btn
                          onClick={() => onDelete(product.id)}
                          variant="danger"
                          size="xs"
                          leftIcon={<TrashIcon className="w-3 h-3" />}
                        >
                          {t('actions.delete')}
                        </Btn>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
} 