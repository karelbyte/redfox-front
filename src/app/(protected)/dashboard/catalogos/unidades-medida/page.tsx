'use client';

import { useState, useEffect } from 'react';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { toastService } from '@/services/toast.service';
import { MeasurementUnit } from '@/types/measurement-unit';
import MeasurementUnitForm from '@/components/Measurement/MeasurementUnitForm';
import MeasurementUnitTable from '@/components/Measurement/MeasurementUnitTable';
import DeleteMeasurementUnitModal from '@/components/Measurement/DeleteMeasurementUnitModal';
import Pagination from '@/components/Pagination/Pagination';

export default function MeasurementUnitsPage() {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<MeasurementUnit | null>(null);

  const fetchUnits = async (page: number) => {
    try {
      setLoading(true);
      const response = await measurementUnitsService.getMeasurementUnits(page);
      setUnits(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      toastService.error('Error al cargar las unidades de medida');
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
      toastService.success('Unidad de medida eliminada correctamente');
      fetchUnits(currentPage);
      setUnitToDelete(null);
    } catch {
      toastService.error('Error al eliminar la unidad de medida');
    }
  };

  const handleEdit = (unit: MeasurementUnit) => {
    setEditingUnit(unit);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUnit(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchUnits(currentPage);
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
        <h1 className="text-2xl font-semibold text-gray-900">Unidades de Medida</h1>
        <button
          onClick={() => {
            setEditingUnit(null);
            setShowModal(true);
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
      ) : (
        <>
          <div className="mt-6">
            <MeasurementUnitTable
              units={units}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        </>
      )}

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingUnit ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
            </h2>
            <MeasurementUnitForm
              unit={editingUnit}
              onClose={handleModalClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <DeleteMeasurementUnitModal
        unit={unitToDelete}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 