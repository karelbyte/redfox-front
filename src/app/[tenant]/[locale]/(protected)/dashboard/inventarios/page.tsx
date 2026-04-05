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
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";
import HelpButton from "@/components/Help/HelpButton";
import { inventoryHelp } from "@/components/Help/configs/inventory.help";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { Btn } from "@/components/atoms";
import { InventoryPDFService } from "@/services/inventory-pdf.service";

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
  const [warehouseValue, setWarehouseValue] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  const availableColumns = [
    { key: "product", label: t("table.product") },
    { key: "sku", label: t("table.sku") },
    { key: "brand", label: t("table.brand") },
    { key: "category", label: t("table.category") },
    { key: "quantity", label: t("table.quantity") },
    { key: "price", label: t("table.price") },
    { key: "date", label: t("table.date") },
    { key: "actions", label: t("table.actions") },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    "inventory_table",
    availableColumns.map((c) => c.key)
  );

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

      // Calcular valor total del almacén con todos los items
      if (response.meta?.totalPages && response.meta.totalPages > 1) {
        // Si hay más de una página, traer todos para calcular el valor
        const allResponse = await inventoryService.getInventoryAll(selectedWarehouseId);
        setWarehouseValue(InventoryPDFService.warehouseValue(allResponse.data));
      } else {
        setWarehouseValue(InventoryPDFService.warehouseValue(response.data));
      }
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

  const handleSyncPack = useCallback(
    async (item: InventoryItem) => {
      try {
        const result = await inventoryService.syncWithPack(item.id);
        if (result.pack_sync_success) {
          toastService.success(t('messages.syncWithPackSuccess'));
          fetchInventory(currentPage);
        } else {
          toastService.error(
            t('messages.syncWithPackError', {
              error: result.pack_sync_error ?? 'Unknown error',
            }),
          );
        }
      } catch {
        toastService.error(t('messages.syncWithPackError', { error: 'Network or server error' }));
      }
    },
    [currentPage, fetchInventory, t],
  );

  const handlePrintInventory = async () => {
    if (!selectedWarehouseId || !selectedWarehouse) return;
    try {
      setIsPrinting(true);
      const allResponse = await inventoryService.getInventoryAll(selectedWarehouseId);
      const currency = selectedWarehouse.currency?.code || 'MXN';
      const isEn = locale === 'en';

      const translations = {
        title: isEn ? 'Warehouse Inventory' : 'Inventario del Almacén',
        warehouse: isEn ? 'Warehouse' : 'Almacén',
        generatedOn: isEn ? 'Generated on' : 'Generado el',
        page: isEn ? 'Page' : 'Página',
        footer: isEn ? 'Automatically generated document — Nitro' : 'Documento generado automáticamente — Nitro',
        product: isEn ? 'Product' : 'Producto',
        sku: 'SKU',
        brand: isEn ? 'Brand' : 'Marca',
        category: isEn ? 'Category' : 'Categoría',
        strategy: isEn ? 'Strategy' : 'Estrategia',
        quantity: isEn ? 'Qty' : 'Cant.',
        unit: isEn ? 'Unit' : 'Unidad',
        unitPrice: isEn ? 'Unit Price' : 'Precio Unit.',
        taxRate: isEn ? 'Tax' : 'Impuesto',
        subtotal: 'Subtotal',
        totalProducts: isEn ? 'Total products' : 'Total productos',
        totalUnits: isEn ? 'Total units' : 'Total unidades',
        warehouseValue: isEn ? 'Warehouse value' : 'Valor del almacén',
        fifo: 'FIFO',
        fefo: 'FEFO',
        average: isEn ? 'Average' : 'Promedio',
      };

      const svc = new InventoryPDFService(locale);
      svc.generate(allResponse.data, selectedWarehouse.name, currency, translations);
    } catch {
      toastService.error(t('messages.errorLoadingInventory'));
    } finally {
      setIsPrinting(false);
    }
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
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--color-primary-700))` }}
          >
            {t('title')}
          </h1>
          <HelpButton config={inventoryHelp} />
        </div>
      </div>

      <div className="mt-6">
        {closedWarehouses.length === 0 ? (
          <EmptyState
            title={t('noClosedWarehouses')}
            description={t('noClosedWarehousesDesc')}
          />
        ) : (
          <>
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
              </div>

              {/* Card de Información */}
              {selectedWarehouseId && (
                <div
                  className="rounded-lg shadow p-6"
                  style={{ backgroundColor: `rgb(var(--color-surface))` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
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
                      {warehouseValue > 0 && (
                        <p className="text-sm mt-2 font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
                          {locale === 'en' ? 'Warehouse value' : 'Valor del almacén'}:{' '}
                          <span>
                            {new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-MX', {
                              style: 'currency',
                              currency: selectedWarehouse?.currency?.code || 'MXN',
                            }).format(warehouseValue)}
                          </span>
                        </p>
                      )}
                    </div>
                    {total > 0 && (
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={handlePrintInventory}
                        disabled={isPrinting}
                        leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                      >
                        {isPrinting
                          ? (locale === 'en' ? 'Generating...' : 'Generando...')
                          : (locale === 'en' ? 'Print inventory' : 'Imprimir inventario')}
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedWarehouseId && (
              <div className="flex justify-end mb-6">
                <ColumnSelector
                  columns={availableColumns}
                  visibleColumns={visibleColumns}
                  onChange={toggleColumn}
                />
              </div>
            )}

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
                      onSyncPack={handleSyncPack}
                      visibleColumns={visibleColumns}
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
