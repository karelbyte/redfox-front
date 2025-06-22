"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
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
import { Btn, EmptyState } from "@/components/atoms";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function OpeningsPage() {
  const t = useTranslations('pages.warehouseOpenings');
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
      toastService.error(t('error.warehouseIdRequired'));
      setLoading(false);
      return;
    }

    try {
      const warehouseResponse = await warehousesService.getWarehouse(warehouseId);
      setWarehouse(warehouseResponse);
    } catch {
      toastService.error(t('error.errorLoadingWarehouse'));
    }
  };

  const fetchOpenings = async (page: number) => {
    if (!warehouseId) {
      toastService.error(t('error.warehouseIdRequired'));
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
      toastService.error(t('error.errorLoadingOpenings'));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toastService.success(t('messages.openingDeleted'));
      fetchOpenings(currentPage);
      setOpeningToDelete(undefined);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('error.errorDeleting'));
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
          <h1 
            className="text-xl font-semibold mb-4"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t('error.title')}
          </h1>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-600))` }}
          >
            {t('error.noWarehouseId')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--color-primary-800))` }}
          >
            {t('title')}
          </h1>
          {(warehouseName || warehouse) && (
            <p 
              className="text-sm mt-1"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {t('warehouse')} <span className="font-medium">{warehouseName || warehouse?.name}</span>
              {warehouse?.currency && (
                <span 
                  className="ml-2"
                  style={{ color: `rgb(var(--color-primary-500))` }}
                >
                  • {t('currency')} {warehouse.currency.code} - {warehouse.currency.name}
                </span>
              )}
            </p>
          )}
          {total > 0 && (
            <p 
              className="text-sm mt-1"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {t('totalProducts', { count: total })}
            </p>
          )}
        </div>
        <Btn
          onClick={() => {
            setDrawerMode('create');
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('newOpening')}
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : openings && openings.length === 0 ? (
        <EmptyState
          title={t('noOpenings')}
          description={t('noOpeningsDesc')}
        />
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
        id="warehouse-opening-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={
          drawerMode === 'create' 
            ? t('newOpening')
            : drawerMode === 'edit' 
            ? t('editOpening')
            : t('productDetailsName')
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