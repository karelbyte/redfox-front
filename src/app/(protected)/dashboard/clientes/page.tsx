"use client";

import { useState, useEffect, useRef } from "react";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import ClientTable from "@/components/Client/ClientTable";
import ClientForm from "@/components/Client/ClientForm";
import DeleteClientModal from "@/components/Client/DeleteClientModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { ClientFormRef } from "@/components/Client/ClientForm";
import { Btn, SearchInput } from "@/components/atoms";
import Pagination from "@/components/Pagination/Pagination";
import Loading from '@/components/Loading/Loading';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<ClientFormRef>(null);

  const fetchClients = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await clientsService.getClients(page, term);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
      
      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error("Error al cargar los clientes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
  }, []);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowDrawer(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedClient(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchClients(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedClient(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchClients(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    fetchClients(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold"  style={{ color: `rgb(var(--color-primary-800))` }}>
          Clientes
        </h1>
        <Btn
          onClick={() => {
            setSelectedClient(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Cliente
        </Btn>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder="Buscar clientes..."
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchClients(1, term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : clients && clients.length === 0 ? (
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
              // Icono de documento para "no hay clientes"
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            )}
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {searchTerm ? 'No se encontraron resultados' : 'No hay clientes'}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {searchTerm ? (
              `No hay clientes que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
            ) : (
              'Haz clic en "Nuevo Cliente" para agregar uno.'
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ClientTable
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
        id="client-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedClient ? "Editar Cliente" : "Nuevo Cliente"}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <ClientForm
          ref={formRef}
          client={selectedClient}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedClient && (
        <DeleteClientModal
          client={selectedClient}
          onClose={handleDeleteModalClose}
          onSuccess={handleDeleteSuccess}
          onDeletingChange={setIsSaving}
        />
      )}
    </div>
  );
} 