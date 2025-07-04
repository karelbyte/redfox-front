'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { warehouseAdjustmentService } from '@/services/warehouse-adjustments.service';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import { WarehouseAdjustmentTable } from '@/components/WarehouseAdjustment/WarehouseAdjustmentTable';
import WarehouseAdjustmentForm, { WarehouseAdjustmentFormRef } from '@/components/WarehouseAdjustment/WarehouseAdjustmentForm';
import { Btn } from '@/components/atoms';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { warehousesService } from '@/services/warehouses.service';
import { Warehouse } from '@/types/warehouse';
import { useRef } from 'react';

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
  const [totalItems, setTotalItems] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<WarehouseAdjustmentFormRef>(null);

  useEffect(() => {
    if (can(['warehouse_adjustment_module_view'])) {
      loadAdjustments();
    }
  }, [currentPage]);

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const response = await warehouseAdjustmentService.getWarehouseAdjustments(currentPage);
      setAdjustments(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error loading adjustments:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adjustmentId: string) => {
    try {
      await warehouseAdjustmentService.deleteWarehouseAdjustment(adjustmentId);
      toastService.success(t('messages.adjustmentDeleted'));
      loadAdjustments();
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorDeleting'));
    }
  };

  const handleClose = async (adjustmentId: string) => {
    try {
      await warehouseAdjustmentService.closeWarehouseAdjustment(adjustmentId);
      toastService.success(t('messages.adjustmentClosed'));
      loadAdjustments();
    } catch (error) {
      console.error('Error closing adjustment:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorClosing'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehousesService.getWarehouses({});
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoadingWarehouses'));
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
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
              onDelete={handleDelete}
              onClose={handleClose}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
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

      {/* Drawer para crear ajustes de almacén */}
      <Drawer
        id="warehouse-adjustment-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <WarehouseAdjustmentForm
          ref={formRef}
          warehouses={warehouses}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>
    </div>
  );
} 