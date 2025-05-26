'use client'

import { useState, useEffect, useRef } from 'react';
import { Tax } from '@/types/tax';
import TaxTable from '@/components/Tax/TaxTable';
import TaxForm, { TaxFormRef } from '@/components/Tax/TaxForm';
import { api } from '@/services/api';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<TaxFormRef>(null);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const data = await api.get<Tax[]>('/taxes');
      setTaxes(data);
    } catch (err) {
      console.error('Error fetching taxes:', err);
      toastService.error('Error al cargar los impuestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleDelete = async (tax: Tax) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este impuesto?')) {
      return;
    }

    try {
      await api.delete(`/taxes/${tax.id}`);
      toastService.success('Impuesto eliminado correctamente');
      await fetchTaxes();
    } catch (err) {
      console.error('Error deleting tax:', err);
      toastService.error('Error al eliminar el impuesto');
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingTax(undefined);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchTaxes();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
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
        <h1 className="text-xl font-semibold text-red-900">
          Impuestos
        </h1>
        <button
          onClick={() => {
            setEditingTax(undefined);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nuevo Impuesto
        </button>
      </div>

      {taxes && taxes.length === 0 ? (
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
            No hay impuestos
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nuevo Impuesto&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <TaxTable
            taxes={taxes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Drawer
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
    </div>
  );
} 