"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import ClientTable from "@/components/Client/ClientTable";
import ClientForm from "@/components/Client/ClientForm";
import DeleteClientModal from "@/components/Client/DeleteClientModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { ClientFormRef } from "@/components/Client/ClientForm";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import Pagination from "@/components/Pagination/Pagination";
import Loading from "@/components/Loading/Loading";
import { usePermissions } from "@/hooks/usePermissions";

export default function ClientsPage() {
  const t = useTranslations("pages.clients");
  const { can } = usePermissions();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<ClientFormRef>(null);
  const initialFetchDone = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchClients = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await clientsService.getClients(page, term);
      setClients(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);

      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t("messages.errorLoading"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
    fetchClients(1);
    }
  }, [fetchClients]);

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
    setCurrentPage(page);
    fetchClients(page, searchTerm);
  };

  if (!can(["client_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          {t("title")}
        </h1>
        {can(["client_create"]) && (
          <Btn
            onClick={() => {
              setSelectedClient(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t("newClient")}
          </Btn>
        )}
      </div>
      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t("searchClients")}
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
        <EmptyState
          searchTerm={searchTerm}
          title={t("noClients")}
          description={t("noClientsDesc")}
          searchDescription={t("noResultsDesc")}
        />
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
        title={selectedClient ? t("editClient") : t("newClient")}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-4xl"
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
