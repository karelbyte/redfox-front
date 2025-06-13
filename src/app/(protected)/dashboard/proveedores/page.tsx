"use client";

import { useState, useEffect, useRef } from "react";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Provider } from "@/types/provider";
import ProviderForm from "@/components/Provider/ProviderForm";
import ProviderTable from "@/components/Provider/ProviderTable";
import DeleteProviderModal from "@/components/Provider/DeleteProviderModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { ProviderFormRef } from "@/components/Provider/ProviderForm";
import { Btn } from "@/components/atoms";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<ProviderFormRef>(null);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await providersService.getProviders();
      setProviders(response.data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error("Error al cargar los proveedores");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDrawer(true);
  };

  const handleDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedProvider(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchProviders();
  };

  const handleDeleteModalClose = () => {
    setSelectedProvider(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchProviders();
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Proveedores
        </h1>
        <Btn
          onClick={() => {
            setSelectedProvider(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Proveedor
        </Btn>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div 
            className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
            style={{ borderColor: `rgb(var(--color-primary-500))` }}
          ></div>
        </div>
      ) : providers && providers.length === 0 ? (
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            No hay proveedores
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            Haz clic en &quot;Nuevo Proveedor&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <ProviderTable
            providers={providers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <ProviderForm
          ref={formRef}
          provider={selectedProvider}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedProvider && (
        <DeleteProviderModal
          provider={selectedProvider}
          onClose={handleDeleteModalClose}
          onSuccess={handleDeleteSuccess}
          onDeletingChange={setIsSaving}
        />
      )}
    </div>
  );
} 