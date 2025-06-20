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
import { Btn, SearchInput } from "@/components/atoms";
import Loading from '@/components/Loading/Loading';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const formRef = useRef<ProviderFormRef>(null);

  const fetchProviders = async (term?: string) => {
    try {
      setIsLoading(true);
      const response = await providersService.getProviders(1, term);
      setProviders(response.data);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
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
    fetchProviders(searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedProvider(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchProviders(searchTerm);
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

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder="Buscar proveedores..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchProviders(term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
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
            {searchTerm ? (
              // Icono de búsqueda para "no hay resultados"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            ) : (
              // Icono de edificio para "no hay proveedores"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            )}
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {searchTerm ? 'No se encontraron resultados' : 'No hay proveedores'}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {searchTerm ? (
              `No hay proveedores que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
            ) : (
              'Haz clic en "Nuevo Proveedor" para agregar uno.'
            )}
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
        id="provider-drawer"
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