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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<ClientFormRef>(null);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await clientsService.getClients();
      setClients(response.data);
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
    fetchClients();
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
    fetchClients();
  };

  const handleDeleteModalClose = () => {
    setSelectedClient(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchClients();
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-red-900">
          Clientes
        </h1>
        <button
          onClick={() => {
            setSelectedClient(null);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Nuevo Cliente
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : clients && clients.length === 0 ? (
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
            No hay clientes
          </p>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Nuevo Cliente&quot; para agregar uno.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <ClientTable
            clients={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Drawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedClient ? "Editar Cliente" : "Nuevo Cliente"}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <ClientForm
          ref={formRef}
          client={selectedClient}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
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