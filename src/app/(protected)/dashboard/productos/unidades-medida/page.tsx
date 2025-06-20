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
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';

export default function MeasurementUnitsPage() {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<MeasurementUnit | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const formRef = useRef<MeasurementUnitFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchUnits = async (page: number, term?: string) => {
    try {
      setLoading(true);
      const response = await measurementUnitsService.getMeasurementUnits(page, term);
      setUnits(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch {
      toastService.error("Error al cargar las unidades de medida");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUnits(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!unitToDelete) return;

    try {
      await measurementUnitsService.deleteMeasurementUnit(unitToDelete.id);
      toastService.success("Unidad de medida eliminada correctamente");
      fetchUnits(currentPage, searchTerm);
      setUnitToDelete(null);
    } catch(error) {
      setUnitToDelete(null);
      toastService.error(error as string);
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
    fetchUnits(currentPage, searchTerm);
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
    fetchUnits(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Unidades de Medida
        </h1>
        <Btn
          onClick={() => {
            setEditingUnit(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nueva Unidad
        </Btn>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder="Buscar unidades de medida..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchUnits(1, term);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : units && units.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title="No hay unidades de medida"
          description="Haz clic en 'Nueva Unidad' para agregar una."
          searchDescription="No se encontraron resultados"
        />
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
        id="measurement-unit-drawer"
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
