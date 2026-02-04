"use client";

import { useTranslations } from 'next-intl';
import { WarehouseOpening } from "@/types/warehouse-opening";
import { Warehouse } from "@/types/warehouse";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface WarehouseOpeningTableProps {
  openings: WarehouseOpening[];
  warehouse: Warehouse | null;
  onViewDetails: (opening: WarehouseOpening) => void;
  onEdit: (opening: WarehouseOpening) => void;
  onDelete: (opening: WarehouseOpening) => void;
  visibleColumns?: string[];
}

export default function WarehouseOpeningTable({
  openings,
  warehouse,
  onViewDetails,
  onEdit,
  onDelete,
  visibleColumns,
}: WarehouseOpeningTableProps) {
  const t = useTranslations('pages.warehouseOpenings');
  const { can } = usePermissions();
  if (!Array.isArray(openings)) {
    return null;
  }

  const formatPrice = (price: number) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return '0.00';
    }

    if (!warehouse?.currency) {
      return numPrice.toFixed(2);
    }

    return `${warehouse.currency.code} ${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const thBase = "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider";
  const tdBase = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
  const hiddenMd = "hidden md:table-cell";
  const hiddenLg = "hidden lg:table-cell";

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isVisible('product') && (
              <th className={`${thBase}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.product')}
              </th>
            )}
            {isVisible('sku') && (
              <th className={`${thBase} ${hiddenMd}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.sku')}
              </th>
            )}
            {isVisible('brand') && (
              <th className={`${thBase} ${hiddenMd}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.brand')}
              </th>
            )}
            {isVisible('category') && (
              <th className={`${thBase} ${hiddenMd}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.category')}
              </th>
            )}
            {isVisible('quantity') && (
              <th className={`${thBase}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.quantity')}
              </th>
            )}
            {isVisible('price') && (
              <th className={`${thBase}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.price')}
              </th>
            )}
            {isVisible('creationDate') && (
              <th className={`${thBase} ${hiddenLg}`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.creationDate')}
              </th>
            )}
            {isVisible('actions') && (
              <th className={`${thBase} text-right px-4 md:px-6`} style={{ color: 'rgb(var(--color-primary-600))' }}>
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {openings.map((opening) => (
            <tr key={opening.id} className="hover:bg-gray-50 transition-colors">
              {isVisible('product') && (
                <td className={`${tdBase} px-4 md:px-6`}>
                  <div className="flex items-center min-w-0">
                    {opening.product.images && opening.product.images.length > 0 && (
                      <div className="flex-shrink-0 h-10 w-10 mr-2 md:mr-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_URL_API}${opening.product.images[0]}`}
                          alt={opening.product.name}
                          width={40}
                          height={40}
                          className="object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {opening.product.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate hidden sm:block">
                        {opening.product.description}
                      </div>
                    </div>
                  </div>
                </td>
              )}
              {isVisible('sku') && (
                <td className={`${tdBase} ${hiddenMd}`}>
                  {opening.product.sku}
                </td>
              )}
              {isVisible('brand') && (
                <td className={`${tdBase} ${hiddenMd}`}>
                  {typeof opening.product.brand === 'object'
                    ? opening.product.brand.description
                    : opening.product.brand}
                </td>
              )}
              {isVisible('category') && (
                <td className={`${tdBase} ${hiddenMd}`}>
                  {typeof opening.product.category === 'object'
                    ? opening.product.category.name
                    : opening.product.category}
                </td>
              )}
              {isVisible('quantity') && (
                <td className={`${tdBase} px-4 md:px-6`}>
                  {opening.quantity}
                </td>
              )}
              {isVisible('price') && (
                <td className={`${tdBase} px-4 md:px-6`}>
                  {formatPrice(opening.price)}
                </td>
              )}
              {isVisible('creationDate') && (
                <td className={`${tdBase} ${hiddenLg}`}>
                  {formatDate(opening.createdAt)}
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(["warehouse_opening_update"]) && <Btn
                      onClick={() => onEdit(opening)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={t('actions.edit')}
                    />}
                    {can(["warehouse_opening_read"]) && <Btn
                      onClick={() => onViewDetails(opening)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                      title={t('actions.viewDetails')}
                    />}
                    {can(["warehouse_opening_delete"]) && <Btn
                      onClick={() => onDelete(opening)}
                      variant="ghost"
                      size="sm"
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={t('actions.delete')}
                      style={{ color: '#dc2626' }}
                    />}
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