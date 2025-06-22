"use client";

import { useTranslations } from "next-intl";
import { InventoryItem } from "@/types/inventory";
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";

interface InventoryTableProps {
  inventoryItems: InventoryItem[];
  currencyCode: string;
  onViewProduct: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
}

export default function InventoryTable({
  inventoryItems,
  currencyCode,
  onViewProduct,
  onViewHistory,
}: InventoryTableProps) {
  const t = useTranslations('pages.inventory');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!Array.isArray(inventoryItems)) {
    return null;
  }

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
              {t('table.price')} ({currencyCode})
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.date')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventoryItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                <div className="text-sm text-gray-500">{item.product.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof item.product.brand === "object"
                  ? item.product.brand.description
                  : item.product.brand}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof item.product.category === "object"
                  ? item.product.category.name
                  : item.product.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="font-medium">{item.quantity}</span>
                <span className="text-gray-500 ml-1">
                  {typeof item.product.measurement_unit === "object"
                    ? item.product.measurement_unit.code
                    : "pz"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {formatPrice(item.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Btn
                    onClick={() => onViewProduct(item)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                    title={t('actions.viewProduct')}
                  />
                  <Btn
                    onClick={() => onViewHistory(item)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<ClockIcon className="h-4 w-4" />}
                    title={t('actions.viewHistory')}
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
