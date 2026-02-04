'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { warehouseAdjustmentService } from '@/services/warehouse-adjustments.service';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import { WarehouseAdjustmentTable } from '@/components/WarehouseAdjustment/WarehouseAdjustmentTable';
import WarehouseAdjustmentForm, { WarehouseAdjustmentFormRef } from '@/components/WarehouseAdjustment/WarehouseAdjustmentForm';
import { DeleteWarehouseAdjustmentModal } from '@/components/WarehouseAdjustment/DeleteWarehouseAdjustmentModal';
import { CloseWarehouseAdjustmentModal } from '@/components/WarehouseAdjustment/CloseWarehouseAdjustmentModal';
import { Btn } from '@/components/atoms';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { warehousesService } from '@/services/warehouses.service';
import { Warehouse } from '@/types/warehouse';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import ColumnSelector from '@/components/Table/ColumnSelector';

export default function WarehouseAdjustmentsPage() {
  const t = useTranslations('pages.warehouseAdjustments');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const { can } = usePermissions();

  const [adjustments, setAdjustments] = useState<WarehouseAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<WarehouseAdjustment | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<WarehouseAdjustment | null>(null);
  const [adjustmentToClose, setAdjustmentToClose] = useState<WarehouseAdjustment | null>(null);
  const formRef = useRef<WarehouseAdjustmentFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: "code", label: t("table.code") },
    { key: "sourceWarehouse", label: t("table.sourceWarehouse") },
    { key: "targetWarehouse", label: t("table.targetWarehouse") },
    { key: "date", label: t("table.date") },
    { key: "description", label: t("table.description") },
    { key: "status", label: t("table.status") },
    { key: "actions", label: t("table.actions") },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    "warehouse_adjustments_table",
    availableColumns.map((c) => c.key)
  );

  useEffect(() => {
    if (!initialFetchDone.current && can(['warehouse_adjustment_module_view'])) {
      initialFetchDone.current = true;
      loadAdjustments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAdjustments = async (page?: number) => {
    const pageToLoad = page || currentPage;
    try {
      setLoading(true);
      const response = await warehouseAdjustmentService.getWarehouseAdjustments(pageToLoad);
      setAdjustments(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading adjustments:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!adjustmentToDelete) return;

    try {
      await warehouseAdjustmentService.deleteWarehouseAdjustment(adjustmentToDelete.id);
      toastService.success(t('messages.adjustmentDeleted'));
      loadAdjustments();
      setAdjustmentToDelete(null);
    } catch (error) {
      setAdjustmentToDelete(null);
      console.error('Error deleting adjustment:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorDeleting'));
    }
  };

  const handleClose = async () => {
    if (!adjustmentToClose) return;

    try {
      await warehouseAdjustmentService.closeWarehouseAdjustment(adjustmentToClose.id);
      toastService.success(t('messages.adjustmentClosed'));
      loadAdjustments();
      setAdjustmentToClose(null);
    } catch (error) {
      setAdjustmentToClose(null);
      console.error('Error closing adjustment:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorClosing'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAdjustments(page);
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehousesService.getWarehouses({ isClosed: true });
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoadingWarehouses'));
    }
  };

  const handleDetails = (adjustment: WarehouseAdjustment) => {
    router.push(`/${locale}/dashboard/almacenes/ajustes-de-almacen/ajustes/${adjustment.id}`);
  };

  const handleEdit = (adjustment: WarehouseAdjustment) => {
    setEditingAdjustment(adjustment);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingAdjustment(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    loadAdjustments();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (adjustment: WarehouseAdjustment) => {
    setAdjustmentToDelete(adjustment);
  };

  const openCloseModal = (adjustment: WarehouseAdjustment) => {
    setAdjustmentToClose(adjustment);
  };

  if (!can(['warehouse_adjustment_module_view'])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{tCommon('messages.noPermission')}</h1>
          <p className="text-gray-600">{t('messages.noPermissionDesc')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        <Btn
          onClick={() => {
            setEditingAdjustment(null);
            loadWarehouses();
            setShowDrawer(true);
          }}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          {t('actions.create')}
        </Btn>
      </div>

      <div className="mt-6 flex justify-end">
        <ColumnSelector
          columns={availableColumns}
          visibleColumns={visibleColumns}
          onChange={toggleColumn}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : adjustments && adjustments.length === 0 ? (
        <div
          className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed"
          style={{ borderColor: `rgb(var(--color-primary-200))` }}
        >
          <svg
            className="h-12 w-12 mb-4"
            style={{ color: `rgb(var(--color-primary-300))` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <p
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {t('noAdjustments')}
          </p>
          <p
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t('noAdjustmentsDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <WarehouseAdjustmentTable
              adjustments={adjustments}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleDetails}
              onClose={openCloseModal}
              visibleColumns={visibleColumns}
            />
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Drawer para crear/editar ajustes de almacén */}
      <Drawer
        id="warehouse-adjustment-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingAdjustment ? t('actions.edit') : t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <WarehouseAdjustmentForm
          ref={formRef}
          warehouses={warehouses}
          initialData={editingAdjustment ? {
            code: editingAdjustment.code,
            sourceWarehouseId: editingAdjustment.sourceWarehouse.id,
            targetWarehouseId: editingAdjustment.targetWarehouse.id,
            date: editingAdjustment.date,
            description: editingAdjustment.description
          } : undefined}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal para eliminar ajuste */}
      {adjustmentToDelete && (
        <DeleteWarehouseAdjustmentModal
          isOpen={!!adjustmentToDelete}
          adjustment={adjustmentToDelete}
          onClose={() => setAdjustmentToDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Modal para cerrar ajuste */}
      {adjustmentToClose && (
        <CloseWarehouseAdjustmentModal
          isOpen={!!adjustmentToClose}
          adjustment={adjustmentToClose}
          onClose={() => setAdjustmentToClose(null)}
          onConfirm={handleClose}
        />
      )}
    </div>
  );
} 