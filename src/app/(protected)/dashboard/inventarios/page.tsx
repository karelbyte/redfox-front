"use client";

import { useState, useEffect } from "react";
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

export default function InventariosPage() {
  const router = useRouter();
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

  useEffect(() => {
    fetchClosedWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchWarehouseDetails();
      fetchInventory(1);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchInventory(currentPage);
    }
  }, [currentPage]);

  const fetchClosedWarehouses = async () => {
    try {
      setLoading(true);
      const response = await closedWarehousesService.getClosedWarehouses();
      setClosedWarehouses(response);

      // Seleccionar el primer almacén automáticamente si hay alguno
      if (response.length > 0) {
        setSelectedWarehouseId(response[0].id);
      }
    } catch {
      toastService.error("Error al cargar almacenes cerrados");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseDetails = async () => {
    if (!selectedWarehouseId) return;

    try {
      const warehouse = await warehousesService.getWarehouse(
        selectedWarehouseId
      );
      setSelectedWarehouse(warehouse);
    } catch {
      toastService.error("Error al cargar detalles del almacén");
    }
  };

  const fetchInventory = async (page: number) => {
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
      toastService.error("Error al cargar inventario");
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

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
    router.push(`/dashboard/inventarios/historial/${item.product.id}/${selectedWarehouseId}`);
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
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">Inventarios</h1>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card de Selección */}
          <div className="bg-white rounded-lg shadow p-6">
            <label
              htmlFor="warehouse-select"
              className="block text-sm font-medium text-red-400 mb-2"
            >
              Seleccionar Almacén <span className="text-red-500">*</span>
            </label>
            {closedWarehouses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0v2a1 1 0 001 1h2a1 1 0 001-1v-2M6 13h2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay almacenes cerrados
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Los inventarios solo están disponibles para almacenes
                    cerrados
                  </p>
                </div>
              </div>
            ) : (
              <select
                id="warehouse-select"
                value={selectedWarehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              >
                <option value="">Seleccionar almacén...</option>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900">
                Inventario del Almacén
              </h2>
              {total > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {total} producto{total !== 1 ? "s" : ""} en inventario
                </p>
              )}
              {total === 0 && !loadingInventory && (
                <p className="text-sm text-gray-500 mt-1">
                  Sin productos en inventario
                </p>
              )}
            </div>
          )}
        </div>

        {selectedWarehouseId && (
          <>
            {loadingInventory ? (
              <div className="bg-white rounded-lg shadow mb-6 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow mb-6 p-8 text-center">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0v2a1 1 0 001 1h2a1 1 0 001-1v-2M6 13h2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Sin inventario
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay productos en el inventario de este almacén
                  </p>
                </div>
              </div>
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
              <div className="bg-white rounded-lg shadow p-4">
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
