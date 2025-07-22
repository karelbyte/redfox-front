'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Tax } from '@/types/tax';
import TaxTable from '@/components/Tax/TaxTable';
import TaxForm, { TaxFormRef } from '@/components/Tax/TaxForm';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';
import { taxesService } from '@/services/taxes.service';
import Pagination from '@/components/Pagination/Pagination';
import DeleteTaxModal from '@/components/Tax/DeleteTaxModal';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

export default function TaxesPage() {
  const t = useTranslations('pages.taxes');
  const { can } = usePermissions();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<TaxFormRef>(null);
  const initialFetchDone = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTaxes = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await taxesService.getTaxes(page, term);
      setTaxes(response.data);
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
    fetchTaxes(1);
    }
  }, [fetchTaxes]);

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setShowDrawer(true);
  };

  const handleDelete = (tax: Tax) => {
    setSelectedTax(tax);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedTax(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchTaxes(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedTax(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchTaxes(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.save();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTaxes(page, searchTerm);
  };

  if (!can(["tax_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        {can(["tax_create"]) && (
          <Btn
            onClick={() => {
              setSelectedTax(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('newTax')}
          </Btn>
        )}
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t('searchTaxes')}
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchTaxes(1, term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : taxes && taxes.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noTaxes')}
          description={t('noTaxesDesc')}
          searchDescription={t('noResultsDesc')}
        />
      ) : (
        <>
          <div className="mt-6">
            <TaxTable
              taxes={taxes}
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
        id="tax-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedTax ? t('editTax') : t('newTax')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <TaxForm
          ref={formRef}
          initialData={selectedTax}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedTax && (
        <DeleteTaxModal
          tax={selectedTax}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteSuccess}
        />
      )}
    </div>
  );
} 