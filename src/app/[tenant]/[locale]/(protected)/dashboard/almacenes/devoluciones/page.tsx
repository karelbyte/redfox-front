'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { returnService } from '@/services';
import { Return } from '@/types/return';
import { Warehouse } from '@/types/warehouse';
import { Btn } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import EmptyState from '@/components/atoms/EmptyState';
import ReturnTable from '@/components/Return/ReturnTable';
import Drawer from '@/components/Drawer/Drawer';
import ReturnForm from '@/components/Return/ReturnForm';
import CloseReturnModal from '@/components/Return/CloseReturnModal';
import DeleteReturnModal from '@/components/Return/DeleteReturnModal';
import { warehousesService } from '@/services';
import { toastService } from '@/services/toast.service';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import ColumnSelector from '@/components/Table/ColumnSelector';

export default function ReturnsPage() {
  const t = useTranslations('pages.returns');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const { can } = usePermissions();

  const [returns, setReturns] = useState<Return[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingReturn, setEditingReturn] = useState<Return | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [returnToDelete, setReturnToDelete] = useState<Return | null>(null);
  const [returnToClose, setReturnToClose] = useState<Return | null>(null);
  const formRef = useRef<{ submit: () => void } | null>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: "code", label: t("table.code") },
    { key: "sourceWarehouse", label: t("table.sourceWarehouse") },
    { key: "targetProvider", label: t("table.targetProvider") },
    { key: "date", label: t("table.date") },
    { key: "description", label: t("table.description") },
    { key: "status", label: t("table.status") },
    { key: "actions", label: t("table.actions") },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    "returns_table",
    availableColumns.map((c) => c.key)
  );

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      if (can(['return_module_view'])) {
        loadReturns();
        loadWarehouses();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReturns = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await returnService.getReturns(page);
      setReturns(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading returns:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async () => {
    if (!returnToDelete) return;

    try {
      await returnService.deleteReturn(returnToDelete.id);
      toastService.success(t('messages.returnDeleted'));
      loadReturns();
      setReturnToDelete(null);
    } catch (error) {
      setReturnToDelete(null);
      console.error('Error deleting return:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorDeleting'));
    }
  };

  const handleClose = async () => {
    if (!returnToClose) return;

    try {
      await returnService.closeReturn(returnToClose.id);
      toastService.success(t('messages.returnClosed'));
      loadReturns();
      setReturnToClose(null);
    } catch (error) {
      setReturnToClose(null);
      console.error('Error closing return:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorClosing'));
    }
  };



  const handleDetails = (returnItem: Return) => {
    router.push(`/${locale}/dashboard/almacenes/devoluciones/devoluciones/${returnItem.id}`);
  };

  const handleEdit = (returnItem: Return) => {
    setEditingReturn(returnItem);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingReturn(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    loadReturns();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (returnItem: Return) => {
    setReturnToDelete(returnItem);
  };

  const openCloseModal = (returnItem: Return) => {
    setReturnToClose(returnItem);
  };

  if (!can(['return_module_view'])) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('subtitle')}
          </p>
        </div>
        {can(['return_create']) && (
          <Btn
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setShowDrawer(true)}
          >
            {t('actions.create')}
          </Btn>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <ColumnSelector
          columns={availableColumns}
          visibleColumns={visibleColumns}
          onChange={toggleColumn}
        />
      </div>

      {/* Content */}
      {
        returns.length === 0 && !loading ? (
          <EmptyState
            title={t('noReturns')}
            description={t('noReturnsDesc')}
            actionButton={can(['return_module_create']) ? (
              <Btn
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setShowDrawer(true)}
              >
                {t('actions.create')}
              </Btn>
            ) : undefined}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ReturnTable
                returns={returns}
                onEdit={handleEdit}
                onDelete={openDeleteModal}
                onDetails={handleDetails}
                onClose={openCloseModal}
                visibleColumns={visibleColumns}
              />
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                {/* Pagination component would go here */}
              </div>
            )}
          </>
        )
      }

      {/* Drawer para crear/editar devolución */}
      <Drawer
        id="return-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingReturn ? t('actions.edit') : t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <ReturnForm
          ref={formRef}
          warehouses={warehouses}
          initialData={editingReturn ? {
            code: editingReturn.code,
            sourceWarehouseId: editingReturn.sourceWarehouse.id,
            targetProviderId: editingReturn.targetProvider.id,
            date: editingReturn.date,
            description: editingReturn.description
          } : undefined}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal para eliminar devolución */}
      {
        returnToDelete && (
          <DeleteReturnModal
            isOpen={!!returnToDelete}
            return={returnToDelete}
            onClose={() => setReturnToDelete(null)}
            onConfirm={handleDelete}
          />
        )
      }

      {/* Modal para cerrar devolución */}
      {
        returnToClose && (
          <CloseReturnModal
            isOpen={!!returnToClose}
            return={returnToClose}
            onClose={() => setReturnToClose(null)}
            onConfirm={handleClose}
          />
        )
      }
    </div >
  );
} 