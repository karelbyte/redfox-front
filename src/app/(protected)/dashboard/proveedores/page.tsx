"use client";

import { useState, useEffect, useRef } from "react";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Provider } from "@/types/provider";
import ProviderForm from "@/components/Provider/ProviderForm";
import ProviderTable from "@/components/Provider/ProviderTable";
import DeleteProviderModal from "@/components/Provider/DeleteProviderModal";
import Pagination from "@/components/Pagination/Pagination";
import Drawer from "@/components/Drawer/Drawer";
import { ProviderFormRef } from "@/components/Provider/ProviderForm";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<ProviderFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchProviders = async (page: number) => {
    try {
      setLoading(true);
      const response = await providersService.getProviders(page);
      setProviders(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      toastService.error("Error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProviders(currentPage);
    }
  }, []);

  useEffect(() => {
    if (initialFetchDone.current) {
      fetchProviders(currentPage);
    }
  }, [currentPage]);

  const handleDelete = async () => {
    if (!providerToDelete) return;

    try {
      await providersService.deleteProvider(providerToDelete.id);
      toastService.success("Proveedor eliminado correctamente");
      fetchProviders(currentPage);
      setProviderToDelete(null);
    } catch {
      toastService.error("Error al eliminar el proveedor");
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingProvider(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchProviders(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (provider: Provider) => {
    setProviderToDelete(provider);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Proveedores
        </h1>
        <button
          onClick={() => {
            setEditingProvider(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nuevo Proveedor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : providers && providers.length === 0 ? (
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
            No hay proveedores
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nuevo Proveedor&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProviderTable
              providers={providers}
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
          editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"
        }
        onSave={handleSave}
        isSaving={isSaving}
      >
        <ProviderForm
          ref={formRef}
          provider={editingProvider}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      {/* Modal de confirmación para eliminar */}
      <DeleteProviderModal
        provider={providerToDelete}
        onClose={() => setProviderToDelete(null)}
        onSuccess={() => {
          setProviderToDelete(null);
          fetchProviders(currentPage);
        }}
        onDeletingChange={setIsSaving}
      />
    </div>
  );
} 