'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Currency } from '@/types/currency';
import CurrencyTable from '@/components/Currency/CurrencyTable';
import CurrencyForm, { CurrencyFormRef } from '@/components/Currency/CurrencyForm';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';
import { currenciesService } from '@/services/currencies.service';
import Pagination from '@/components/Pagination/Pagination';
import DeleteCurrencyModal from '@/components/Currency/DeleteCurrencyModal';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

export default function CurrenciesPage() {
  const t = useTranslations('pages.currencies');
  const { can } = usePermissions();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<CurrencyFormRef>(null);

  const fetchCurrencies = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await currenciesService.getCurrencies(page, term);
      setCurrencies(response.data || []);
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
    fetchCurrencies(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowDrawer(true);
  };

  const handleDelete = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedCurrency(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchCurrencies(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedCurrency(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchCurrencies(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    fetchCurrencies(page, searchTerm);
  };

  if (!can(["currency_module_view"])) {
    return <div>{t("noPermission")}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        {can(["currency_create"]) && (
          <Btn
            onClick={() => {
              setSelectedCurrency(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('newCurrency')}
          </Btn>
        )}
      </div>

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t('searchCurrencies')}
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchCurrencies(1, term);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : currencies && currencies.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noCurrencies')}
          description={t('noCurrenciesDesc')}
          searchDescription={t('noResultsDesc')}
        />
      ) : (
        <>
          <div className="mt-6">
            <CurrencyTable
              currencies={currencies}
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
        id="currency-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedCurrency ? t('editCurrency') : t('newCurrency')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <CurrencyForm
          ref={formRef}
          initialData={selectedCurrency}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedCurrency && (
        <DeleteCurrencyModal
          currency={selectedCurrency}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteSuccess}
        />
      )}
    </div>
  );
} 