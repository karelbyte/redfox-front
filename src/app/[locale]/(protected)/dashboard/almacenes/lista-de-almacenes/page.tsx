"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
import { Btn, EmptyState } from "@/components/atoms";
import { PlusIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "@/hooks/usePermissions";
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";

export default function WarehousesPage() {
  const t = useTranslations("pages.warehouses");
  const { can } = usePermissions();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<WarehouseFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: "code", label: t("table.code") },
    { key: "name", label: t("table.name") },
    { key: "address", label: t("table.address") },
    { key: "phone", label: t("table.phone") },
    { key: "currency", label: t("table.currency") },
    { key: "status", label: t("table.status") },
    { key: "opening", label: t("table.opening") },
    { key: "actions", label: t("table.actions") },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    "warehouses_table",
    availableColumns.map((c) => c.key)
  );

  const fetchWarehouses = async (page: number) => {
    try {
      setLoading(true);
      const response = await warehousesService.getWarehouses({ page });
      setWarehouses(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch {
      toastService.error(t("messages.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWarehouses(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!warehouseToDelete) return;

    try {
      await warehousesService.deleteWarehouse(warehouseToDelete.id);
      toastService.success(t("messages.warehouseDeleted"));
      fetchWarehouses(currentPage);
      setWarehouseToDelete(null);
    } catch {
      toastService.error(t("messages.errorDeleting"));
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

  if (!can(["warehouse_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: "rgb(var(--color-primary-800))" }}
        >
          {t("title")}
        </h1>
        {can(["warehouse_create"]) && (
          <Btn
            onClick={() => {
              setEditingWarehouse(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t("newWarehouse")}
          </Btn>
        )}
      </div>

      <div className="my-6 flex justify-end ">
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
      ) : warehouses && warehouses.length === 0 ? (
        <EmptyState
          title={t("noWarehouses")}
          description={t("noWarehousesDesc")}
        />
      ) : (
        <>
          <WarehouseTable
            warehouses={warehouses}
            onEdit={handleEdit}
            onDelete={openDeleteModal}
            onReload={handleReload}
            visibleColumns={visibleColumns}
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
        title={editingWarehouse ? t("editWarehouse") : t("newWarehouse")}
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
