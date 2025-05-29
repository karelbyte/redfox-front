"use client";

import { useState, useEffect, useRef } from "react";
import { Warehouse } from "@/types/warehouse";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";
import WarehouseTable from "@/components/Warehouse/WarehouseTable";
import WarehouseForm from "@/components/Warehouse/WarehouseForm";
import DeleteWarehouseModal from "@/components/Warehouse/DeleteWarehouseModal";
import Drawer from "@/components/Drawer/Drawer";
import { WarehouseFormRef } from "@/components/Warehouse/WarehouseForm";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<WarehouseFormRef>(null);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const response = await warehousesService.getWarehouses();
      setWarehouses(response.data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error("Error al cargar los almacenes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDrawer(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedWarehouse(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchWarehouses();
  };

  const handleDeleteModalClose = () => {
    setSelectedWarehouse(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchWarehouses();
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Almacenes
        </h1>
        <button
          onClick={() => {
            setSelectedWarehouse(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nuevo Almacén
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : warehouses && warehouses.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-red-200">
          <svg
            className="h-12 w-12 text-red-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium text-red-400 mb-2">
            No hay almacenes
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nuevo Almacén&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <WarehouseTable
            warehouses={warehouses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedWarehouse ? "Editar Almacén" : "Nuevo Almacén"}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <WarehouseForm
          ref={formRef}
          warehouse={selectedWarehouse}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      {isDeleteModalOpen && selectedWarehouse && (
        <DeleteWarehouseModal
          warehouse={selectedWarehouse}
          onClose={handleDeleteModalClose}
          onSuccess={handleDeleteSuccess}
          onDeletingChange={setIsSaving}
        />
      )}
    </div>
  );
} 