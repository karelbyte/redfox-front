"use client";

import { useState, useEffect, useRef } from "react";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";
import { Warehouse } from "@/types/warehouse";
import WarehouseForm from "@/components/Warehouse/WarehouseForm";
import WarehouseTable from "@/components/Warehouse/WarehouseTable";
import DeleteWarehouseModal from "@/components/Warehouse/DeleteWarehouseModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import { WarehouseFormRef } from "@/components/Warehouse/WarehouseForm";
import Loading from "@/components/Loading/Loading";
import { Btn } from "@/components/atoms";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<WarehouseFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchWarehouses = async (page: number) => {
    try {
      setLoading(true);
      const response = await warehousesService.getWarehouses(page);
      setWarehouses(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      toastService.error("Error al cargar los almacenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWarehouses(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!warehouseToDelete) return;

    try {
      await warehousesService.deleteWarehouse(warehouseToDelete.id);
      toastService.success("Almacén eliminado correctamente");
      fetchWarehouses(currentPage);
      setWarehouseToDelete(null);
    } catch {
      toastService.error("Error al eliminar el almacén");
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingWarehouse(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchWarehouses(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchWarehouses(page);
  };

  const handleReload = () => {
    fetchWarehouses(currentPage);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>
          Lista de Almacenes
        </h1>
        <Btn
          onClick={() => {
            setEditingWarehouse(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Almacén
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : warehouses && warehouses.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed" style={{ borderColor: 'rgb(var(--color-primary-200))' }}>
          <svg
            className="h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'rgb(var(--color-primary-300))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2" style={{ color: 'rgb(var(--color-primary-400))' }}>
            No hay almacenes
          </p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-primary-300))' }}>
            Haz clic en &quot;Nuevo Almacén&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <>
          <WarehouseTable
            warehouses={warehouses}
            onEdit={handleEdit}
            onDelete={openDeleteModal}
            onReload={handleReload}
          />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Drawer para crear/editar */}
      <Drawer
        id="warehouse-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <WarehouseForm
          ref={formRef}
          warehouse={editingWarehouse}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteWarehouseModal
        warehouse={warehouseToDelete}
        onClose={() => setWarehouseToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 