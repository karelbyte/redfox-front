"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { warehouseOpeningsService } from "@/services/warehouse-openings.service";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";
import { WarehouseOpening } from "@/types/warehouse-opening";
import { Warehouse } from "@/types/warehouse";
import WarehouseOpeningTable from "@/components/Warehouse/WarehouseOpeningTable";
import WarehouseOpeningForm from "@/components/Warehouse/WarehouseOpeningForm";
import { WarehouseOpeningFormRef } from "@/components/Warehouse/WarehouseOpeningForm";
import ProductDetailsForm from "@/components/Warehouse/ProductDetailsForm";
import { ProductDetailsFormRef } from "@/components/Warehouse/ProductDetailsForm";
import DeleteWarehouseOpeningModal from "@/components/Warehouse/DeleteWarehouseOpeningModal";
import Pagination from "@/components/Pagination/Pagination";
import Loading from "@/components/Loading/Loading";
import Drawer from "@/components/Drawer/Drawer";

export default function AperturasPage() {
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get('warehouse_id');
  const warehouseName = searchParams.get('warehouse_name');
  
  const [openings, setOpenings] = useState<WarehouseOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'details'>('create');
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState<WarehouseOpening | null>(null);
  const [openingToDelete, setOpeningToDelete] = useState<WarehouseOpening | undefined>(undefined);
  const createFormRef = useRef<WarehouseOpeningFormRef>(null);
  const detailsFormRef = useRef<ProductDetailsFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchWarehouse = async () => {
    if (!warehouseId) {
      toastService.error("ID de almacén no proporcionado");
      setLoading(false);
      return;
    }

    try {
      const warehouseResponse = await warehousesService.getWarehouse(warehouseId);
      setWarehouse(warehouseResponse);
    } catch {
      toastService.error("Error al cargar la información del almacén");
    }
  };

  const fetchOpenings = async (page: number) => {
    if (!warehouseId) {
      toastService.error("ID de almacén no proporcionado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await warehouseOpeningsService.getWarehouseOpenings(
        warehouseId,
        page,
        10
      );
      setOpenings(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch {
      toastService.error("Error al cargar las aperturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current && warehouseId) {
      initialFetchDone.current = true;
      fetchWarehouse();
      fetchOpenings(currentPage);
    }
  }, [warehouseId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOpenings(page);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setIsSaving(false);
    setSelectedOpening(null);
    setDrawerMode('create');
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    if (drawerMode === 'create' || drawerMode === 'edit') {
      fetchOpenings(currentPage);
    }
  };

  const handleSave = () => {
    if ((drawerMode === 'create' || drawerMode === 'edit') && createFormRef.current) {
      createFormRef.current.submit();
    } else if (drawerMode === 'details' && detailsFormRef.current) {
      detailsFormRef.current.submit();
    }
  };

  const handleViewDetails = (opening: WarehouseOpening) => {
    setSelectedOpening(opening);
    setDrawerMode('details');
    setShowDrawer(true);
  };

  const handleEdit = (opening: WarehouseOpening) => {
    setSelectedOpening(opening);
    setDrawerMode('edit');
    setShowDrawer(true);
  };

  const handleDelete = (opening: WarehouseOpening) => {
    setOpeningToDelete(opening);
  };

  const handleConfirmDelete = async () => {
    if (!openingToDelete) return;

    try {
      await warehouseOpeningsService.deleteWarehouseOpening(openingToDelete.id);
      toastService.success("Apertura eliminada correctamente");
      fetchOpenings(currentPage);
      setOpeningToDelete(undefined);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error("Error al eliminar la apertura");
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setOpeningToDelete(undefined);
  };

  if (!warehouseId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-900 mb-4">
            Error
          </h1>
          <p className="text-gray-600">
            No se proporcionó un ID de almacén válido
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-red-900">
            Aperturas de Almacén
          </h1>
          {(warehouseName || warehouse) && (
            <p className="text-sm text-gray-600 mt-1">
              Almacén: <span className="font-medium">{warehouseName || warehouse?.name}</span>
              {warehouse?.currency && (
                <span className="ml-2 text-blue-600">
                  • Moneda: {warehouse.currency.code} - {warehouse.currency.name}
                </span>
              )}
            </p>
          )}
          {total > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {total} productos
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setDrawerMode('create');
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Apertura
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : openings && openings.length === 0 ? (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-lg font-medium text-red-400 mb-2">
            No hay aperturas registradas
          </p>
          <p className="text-sm text-red-300">
            Este almacén no tiene productos registrados en su apertura.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <WarehouseOpeningTable 
              openings={openings} 
              warehouse={warehouse}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Drawer para crear/ver aperturas */}
      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={
          drawerMode === 'create' 
            ? 'Nueva Apertura' 
            : drawerMode === 'edit' 
            ? 'Editar Apertura'
            : 'Detalles del Producto'
        }
        onSave={drawerMode === 'details' ? undefined : handleSave}
        isSaving={isSaving}
        isFormValid={drawerMode === 'details' ? true : isFormValid}
        width={drawerMode === 'details' ? 'max-w-4xl' : 'max-w-md'}
      >
        {drawerMode === 'create' || drawerMode === 'edit' ? (
          <WarehouseOpeningForm
            ref={createFormRef}
            warehouseId={warehouseId}
            warehouse={warehouse}
            opening={drawerMode === 'edit' ? selectedOpening : null}
            onClose={handleDrawerClose}
            onSuccess={handleFormSuccess}
            onSavingChange={setIsSaving}
            onValidChange={setIsFormValid}
          />
        ) : (
          <ProductDetailsForm
            ref={detailsFormRef}
            opening={selectedOpening}
            warehouse={warehouse}
            onClose={handleDrawerClose}
            onSuccess={handleFormSuccess}
            onSavingChange={setIsSaving}
            onValidChange={setIsFormValid}
          />
        )}
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteWarehouseOpeningModal
        opening={openingToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 