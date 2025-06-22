"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ClosedWarehouse } from "@/types/closed-warehouse";
import { InventoryItem, InventoryResponse } from "@/types/inventory";
import { closedWarehousesService } from "@/services/closed-warehouses.service";
import { inventoryService } from "@/services/inventory.service";
import { warehousesService } from "@/services/warehouses.service";
import { Warehouse } from "@/types/warehouse";
import { toastService } from "@/services/toast.service";
import InventoryTable from "@/components/Inventory/InventoryTable";
import ProductDetailsModal from "@/components/Inventory/ProductDetailsModal";
import Pagination from "@/components/Pagination/Pagination";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading/Loading";
import EmptyState from "@/components/atoms/EmptyState";

export default function InventariosPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.inventory');
  const [closedWarehouses, setClosedWarehouses] = useState<ClosedWarehouse[]>(
    []
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchClosedWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await closedWarehousesService.getClosedWarehouses();
      setClosedWarehouses(response);

      // Seleccionar el primer almacén automáticamente si hay alguno
      if (response.length > 0) {
        setSelectedWarehouseId(response[0].id);
      }
    } catch {
      toastService.error(t('messages.errorLoadingClosedWarehouses'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchWarehouseDetails = useCallback(async () => {
    if (!selectedWarehouseId) return;

    try {
      const warehouse = await warehousesService.getWarehouse(
        selectedWarehouseId
      );
      setSelectedWarehouse(warehouse);
    } catch {
      toastService.error(t('messages.errorLoadingWarehouseDetails'));
    }
  }, [selectedWarehouseId, t]);

  const fetchInventory = useCallback(async (page: number) => {
    if (!selectedWarehouseId) return;

    try {
      setLoadingInventory(true);
      const response: InventoryResponse = await inventoryService.getInventory(
        selectedWarehouseId,
        page
      );
      setInventoryItems(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
      setCurrentPage(page);
    } catch {
      toastService.error(t('messages.errorLoadingInventory'));
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  }, [selectedWarehouseId, t]);

  useEffect(() => {
    fetchClosedWarehouses();
  }, [fetchClosedWarehouses]);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchWarehouseDetails();
      fetchInventory(1);
    }
  }, [fetchInventory, fetchWarehouseDetails, selectedWarehouseId]);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchInventory(currentPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchInventory]);

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setCurrentPage(1);
    setInventoryItems([]);
  };

  const handleViewProduct = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleViewHistory = (item: InventoryItem) => {
    router.push(`/${locale}/dashboard/inventarios/historial/${item.product.id}/${selectedWarehouseId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 
          className="text-xl font-semibold"
          style={{ color: `rgb(var(--color-primary-700))` }}
        >
          {t('title')}
        </h1>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card de Selección */}
          <div 
            className="rounded-lg shadow p-6"
            style={{ backgroundColor: `rgb(var(--color-surface))` }}
          >
            <label
              htmlFor="warehouse-select"
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {t('selectWarehouse')} <span style={{ color: `rgb(var(--color-error-500))` }}>*</span>
            </label>
            {closedWarehouses.length === 0 ? (
              <EmptyState
                title={t('noClosedWarehouses')}
                description={t('noClosedWarehousesDesc')}
              />
            ) : (
              <select
                id="warehouse-select"
                value={selectedWarehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                style={{
                  backgroundColor: `rgb(var(--color-surface))`,
                  borderColor: `rgb(var(--color-border))`,
                  color: `rgb(var(--color-text-primary))`,
                  '--tw-ring-color': `rgb(var(--color-primary-500))`,
                } as React.CSSProperties}
              >
                <option value="">{t('form.selectWarehouse')}</option>
                {closedWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}{" "}
                    {warehouse.currency ? `(${warehouse.currency.code})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Card de Información */}
          {selectedWarehouseId && (
            <div 
              className="rounded-lg shadow p-6"
              style={{ backgroundColor: `rgb(var(--color-surface))` }}
            >
              <h2 
                className="text-lg font-medium"
                style={{ color: `rgb(var(--color-text-primary))` }}
              >
                {t('warehouseInventory')}
              </h2>
              {total > 0 && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: `rgb(var(--color-text-secondary))` }}
                >
                  {t('productsInInventory', { count: total })}
                </p>
              )}
              {total === 0 && !loadingInventory && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: `rgb(var(--color-text-secondary))` }}
                >
                  {t('noProductsInInventory')}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedWarehouseId && (
          <>
            {loadingInventory ? (
              <div 
                className="rounded-lg shadow mb-6 p-8"
                style={{ backgroundColor: `rgb(var(--color-surface))` }}
              >
                <div className="animate-pulse space-y-4">
                  <div 
                    className="h-4 rounded w-3/4"
                    style={{ backgroundColor: `rgb(var(--color-border))` }}
                  ></div>
                  <div 
                    className="h-4 rounded w-1/2"
                    style={{ backgroundColor: `rgb(var(--color-border))` }}
                  ></div>
                  <div 
                    className="h-4 rounded w-5/6"
                    style={{ backgroundColor: `rgb(var(--color-border))` }}
                  ></div>
                </div>
              </div>
            ) : inventoryItems.length === 0 ? (
              <EmptyState
                title={t('noProductsInInventory')}
                description="No hay productos en el inventario de este almacén"
              />
            ) : (
              <div className="mb-6">
                <InventoryTable
                  inventoryItems={inventoryItems}
                  currencyCode={selectedWarehouse?.currency?.code || "N/A"}
                  onViewProduct={handleViewProduct}
                  onViewHistory={handleViewHistory}
                />
              </div>
            )}

            {!loadingInventory && totalPages > 1 && (
              <div 
                className="rounded-lg shadow p-4"
                style={{ backgroundColor: `rgb(var(--color-surface))` }}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        <ProductDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
          currencyCode={selectedWarehouse?.currency?.code || "N/A"}
        />
      </div>
    </div>
  );
}
