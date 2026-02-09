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
import ExportButton from "@/components/atoms/ExportButton";
import BulkActionsBar from "@/components/atoms/BulkActionsBar";
import { useBulkSelection, BulkAction } from "@/hooks/useBulkSelection";
import AdvancedFilters, { FilterField } from "@/components/atoms/AdvancedFilters";
import Loading from '@/components/Loading/Loading';
import Pagination from "@/components/Pagination/Pagination";
import { usePermissions } from "@/hooks/usePermissions";
import { useColumnPersistence } from "@/hooks/useColumnPersistence";
import ColumnSelector from "@/components/Table/ColumnSelector";

export default function ProvidersPage() {
  const t = useTranslations('pages.providers');
  const tCommon = useTranslations('common');
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

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    hasSelection,
  } = useBulkSelection(providers.map(p => ({ ...p, id: p.id })));

  const availableColumns = [
    { key: 'code', label: t('table.code') },
    { key: 'name', label: t('table.name') },
    { key: 'description', label: t('table.description') },
    { key: 'email', label: t('table.email') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'providers_table',
    availableColumns.map(c => c.key)
  );

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

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: tCommon('actions.delete'),
      color: 'danger',
      requiresConfirm: true,
      onClick: async () => {
        try {
          await providersService.deleteProviders(selectedIds);
          toastService.success(t('messages.deleteSuccess'));
          clearSelection();
          fetchProviders(currentPage, searchTerm);
        } catch (error) {
          console.error('Error deleting providers:', error);
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('messages.errorDelete'));
          }
        }
      },
    },
  ];

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
        <div className="flex items-center gap-2">

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
      </div>

      {/* Filtro de búsqueda - Solo mostrar si hay proveedores o si se está buscando */}
      {(providers.length > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t('searchProviders')}
              onSearch={(term: string) => {
                setSearchTerm(term);
                fetchProviders(1, term);
              }}
            />
          </div>
          {providers.length > 0 && (
            <>
              <ExportButton
                data={providers}
                filename="providers"
                columns={['code', 'name', 'email', 'phone', 'status']}
              />
              <AdvancedFilters
                fields={[
                  {
                    key: 'status',
                    label: t('table.status'),
                    type: 'select',
                    options: [
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' },
                    ],
                  },
                ]}
                onApply={(filters) => {
                  // Apply filters
                }}
                storageKey="provider-advanced-filters"
              />
            </>
          )}
          <ColumnSelector
            columns={availableColumns}
            visibleColumns={visibleColumns}
            onChange={toggleColumn}
          />
        </div>
      )}

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
              visibleColumns={visibleColumns}
              selectedIds={selectedIds}
              onSelectChange={toggleSelect}
              onSelectAllChange={toggleSelectAll}
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

      {hasSelection && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClose={clearSelection}
        />
      )}
    </div>
  );
} 