"use client";

import { useTranslations } from 'next-intl';
import { WarehouseOpening } from "@/types/warehouse-opening";
import { Warehouse } from "@/types/warehouse";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";
import Image from "next/image";

interface WarehouseOpeningTableProps {
  openings: WarehouseOpening[];
  warehouse: Warehouse | null;
  onViewDetails: (opening: WarehouseOpening) => void;
  onEdit: (opening: WarehouseOpening) => void;
  onDelete: (opening: WarehouseOpening) => void;
}

export default function WarehouseOpeningTable({
  openings,
  warehouse,
  onViewDetails,
  onEdit,
  onDelete,
}: WarehouseOpeningTableProps) {
  const t = useTranslations('pages.warehouseOpenings');
  
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.product')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.sku')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.brand')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.category')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.quantity')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.price')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.creationDate')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {openings.map((opening) => (
            <tr key={opening.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {opening.product.images && opening.product.images.length > 0 && (
                    <div className="flex-shrink-0 h-10 w-10 mr-4">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_URL_API}${opening.product.images[0]}`}
                        alt={opening.product.name}
                        width={40}
                        height={40}
                        className="object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {opening.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {opening.product.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {opening.product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof opening.product.brand === 'object' 
                  ? opening.product.brand.description
                  
                  : opening.product.brand}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof opening.product.category === 'object' 
                  ? opening.product.category.name 
                  : opening.product.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {opening.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPrice(opening.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(opening.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    onClick={() => onEdit(opening)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title={t('actions.edit')}
                  />
                  <Btn
                    onClick={() => onViewDetails(opening)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewDetails')}
                  />
                  <Btn
                    onClick={() => onDelete(opening)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    title={t('actions.delete')}
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