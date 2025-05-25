"use client";

import { useState, useEffect, useRef } from "react";
import { measurementUnitsService } from "@/services/measurement-units.service";
import { toastService } from "@/services/toast.service";
import { MeasurementUnit } from "@/types/measurement-unit";
import MeasurementUnitForm from "@/components/Measurement/MeasurementUnitForm";
import MeasurementUnitTable from "@/components/Measurement/MeasurementUnitTable";
import DeleteMeasurementUnitModal from "@/components/Measurement/DeleteMeasurementUnitModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import { MeasurementUnitFormRef } from "@/components/Measurement/MeasurementUnitForm";

export default function MeasurementUnitsPage() {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<MeasurementUnit | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<MeasurementUnitFormRef>(null);

  const fetchUnits = async (page: number) => {
    try {
      setLoading(true);
      const response = await measurementUnitsService.getMeasurementUnits(page);
      setUnits(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      toastService.error("Error al cargar las unidades de medida");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits(currentPage);
  }, [currentPage]);

  const handleDelete = async () => {
    if (!unitToDelete) return;

    try {
      await measurementUnitsService.deleteMeasurementUnit(unitToDelete.id);
      toastService.success("Unidad de medida eliminada correctamente");
      fetchUnits(currentPage);
      setUnitToDelete(null);
    } catch {
      toastService.error("Error al eliminar la unidad de medida");
    }
  };

  const handleEdit = (unit: MeasurementUnit) => {
    setEditingUnit(unit);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingUnit(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchUnits(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (unit: MeasurementUnit) => {
    setUnitToDelete(unit);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Unidades de Medida
        </h1>
        <button
          onClick={() => {
            setEditingUnit(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Unidad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : units && units.length === 0 ? (
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
            No hay unidades de medida
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nueva Unidad&quot; para agregar una.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <MeasurementUnitTable
              units={units}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
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

      {/* Drawer para crear/editar */}
      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={
          editingUnit ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"
        }
        onSave={handleSave}
        isSaving={isSaving}
      >
        <MeasurementUnitForm
          ref={formRef}
          unit={editingUnit}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteMeasurementUnitModal
        unit={unitToDelete}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
