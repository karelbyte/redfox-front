"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Provider } from "@/types/provider";
import ProviderForm from "@/components/Provider/ProviderForm";
import ProviderTable from "@/components/Provider/ProviderTable";
import DeleteProviderModal from "@/components/Provider/DeleteProviderModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import Drawer from "@/components/Drawer/Drawer";
import { ProviderFormRef } from "@/components/Provider/ProviderForm";
import { Btn, SearchInput, EmptyState } from "@/components/atoms";
import Loading from '@/components/Loading/Loading';
import Pagination from "@/components/Pagination/Pagination";
import { usePermissions } from "@/hooks/usePermissions";

export default function ProvidersPage() {
  const t = useTranslations('pages.providers');
  const { can } = usePermissions();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<ProviderFormRef>(null);
  const initialFetchDone = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchProviders = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await providersService.getProviders(page, term);
      setProviders(response.data || []);
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
        toastService.error(t('messages.errorLoading'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
    fetchProviders(1);
    }
  }, [fetchProviders]);

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
    fetchProviders(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedProvider(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchProviders(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProviders(page, searchTerm);
  };

  if (!can(["provider_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        {can(["provider_create"]) && (
          <Btn
            onClick={() => {
              setSelectedProvider(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('newProvider')}
          </Btn>
        )}
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t('searchProviders')}
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchProviders(1, term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : providers && providers.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noProviders')}
          description={t('noProvidersDesc')}
          searchDescription={t('noResultsDesc')}
        />
      ) : (
        <>
          <div className="mt-6">
            <ProviderTable
              providers={providers}
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
        id="provider-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedProvider ? t('editProvider') : t('newProvider')}
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