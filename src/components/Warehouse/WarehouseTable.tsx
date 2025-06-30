"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Warehouse, WarehouseCloseResponse } from "@/types/warehouse";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";
import ConfirmModal from "../Modal/ConfirmModal";
import WarehouseCloseResultModal from "./WarehouseCloseResultModal";
import { Btn } from "@/components/atoms";
import { usePermissions } from "@/hooks/usePermissions";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onReload: () => void;
}

export default function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
  onReload,
}: WarehouseTableProps) {
  const t = useTranslations("pages.warehouses");
  const { can } = usePermissions();
  const router = useRouter();
  const locale = useLocale();
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [closeResult, setCloseResult] = useState<WarehouseCloseResponse | null>(
    null
  );

  const handleCloseWarehouse = async (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsConfirmModalOpen(true);
  };

  const handleOpenAperturas = (warehouse: Warehouse) => {
    router.push(
      `/${locale}/dashboard/almacenes/aperturas?warehouse_id=${
        warehouse.id
      }&warehouse_name=${encodeURIComponent(warehouse.name)}`
    );
  };

  const handleConfirmClose = async () => {
    if (!selectedWarehouse) return;

    try {
      const result = await warehousesService.closeWarehouse(
        selectedWarehouse.id
      );
      setCloseResult(result);
      setIsConfirmModalOpen(false);
      setIsResultModalOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t("messages.errorClosing"));
      }
      setIsConfirmModalOpen(false);
      setSelectedWarehouse(null);
    }
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setCloseResult(null);
    setSelectedWarehouse(null);
    // Recargar datos después de cerrar la modal de resultados
    onReload();
  };

  if (!Array.isArray(warehouses)) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.code")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.name")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.address")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.phone")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.currency")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.status")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.opening")}
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: "rgb(var(--color-primary-600))" }}
              >
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr
                key={warehouse.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {warehouse.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {warehouse.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {warehouse.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {warehouse.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {warehouse.currency?.code} - {warehouse.currency?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      warehouse.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {warehouse.status
                      ? t("status.active")
                      : t("status.inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      warehouse.is_open
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {warehouse.is_open ? t("status.open") : t("status.closed")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {warehouse.is_open &&
                      can([
                        "warehouse_opening_module_view",
                        "warehouse_opening_create",
                      ]) && (
                        <Btn
                          onClick={() => handleOpenAperturas(warehouse)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<EyeIcon className="h-4 w-4" />}
                          title={t("actions.open")}
                          style={{ color: "#059669" }}
                        />
                      )}
                    {warehouse.is_open && can(["warehouse_close"]) && (
                      <Btn
                        onClick={() => handleCloseWarehouse(warehouse)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        title={t("actions.close")}
                        style={{ color: "#dc2626" }}
                      />
                    )}
                    {can(["warehouse_update"]) && (
                      <Btn
                        onClick={() => onEdit(warehouse)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={t("actions.edit")}
                      />
                    )}
                    {can(["warehouse_delete"]) && (
                      <Btn
                        onClick={() => warehouse.is_open && onDelete(warehouse)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={
                          !warehouse.is_open
                            ? t("actions.cannotDeleteClosed")
                            : t("actions.delete")
                        }
                        disabled={!warehouse.is_open}
                        style={
                          !warehouse.is_open
                            ? { color: "#9ca3af" }
                            : { color: "#dc2626" }
                        }
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedWarehouse(null);
        }}
        onConfirm={handleConfirmClose}
        title={t("actions.close")}
        message={
          <>
            {t("messages.confirmClose", {
              name: selectedWarehouse?.name || "",
            })}
          </>
        }
        confirmText={t("actions.close")}
      />

      <WarehouseCloseResultModal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        result={closeResult}
      />
    </>
  );
}
