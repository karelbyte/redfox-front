'use client'

import { useState, useEffect, useRef } from 'react';
import { Tax } from '@/types/tax';
import TaxTable from '@/components/Tax/TaxTable';
import TaxForm, { TaxFormRef } from '@/components/Tax/TaxForm';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';
import { taxesService } from '@/services/taxes.service';
import Pagination from '@/components/Pagination/Pagination';
import DeleteTaxModal from '@/components/Tax/DeleteTaxModal';
import { Btn } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<TaxFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchTaxes = async (page: number) => {
    try {
      setLoading(true);
      const response = await taxesService.getTaxes(page);
      setTaxes(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error('Error fetching taxes:', err);
      toastService.error("Error al cargar los impuestos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchTaxes(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!taxToDelete) return;

    try {
      await taxesService.deleteTax(taxToDelete.id);
      toastService.success('Impuesto eliminado correctamente');
      fetchTaxes(currentPage);
      setTaxToDelete(null);
    } catch {
      toastService.error('Error al eliminar el impuesto');
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingTax(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchTaxes(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.save();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTaxes(page);
  };

  const openDeleteModal = (tax: Tax) => {
    setTaxToDelete(tax);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--color-primary-800))' }}>
          Impuestos
        </h1>
        <Btn
          onClick={() => {
            setEditingTax(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Impuesto
        </Btn>
      </div>

      {taxes && taxes.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed" style={{ borderColor: 'rgb(var(--color-primary-200))' }}>
          <svg
            className="h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'rgb(var(--color-primary-300))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2" style={{ color: 'rgb(var(--color-primary-400))' }}>
            No hay impuestos
          </p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-primary-300))' }}>
            Haz clic en &quot;Nuevo Impuesto&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <TaxTable
              taxes={taxes}
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

      <Drawer
        id="tax-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <TaxForm
          ref={formRef}
          initialData={editingTax}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      <DeleteTaxModal
        tax={taxToDelete}
        onClose={() => setTaxToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 