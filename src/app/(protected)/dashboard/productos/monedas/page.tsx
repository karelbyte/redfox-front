'use client'

import { useState, useEffect, useRef } from 'react';
import { Currency } from '@/types/currency';
import CurrencyTable from '@/components/Currency/CurrencyTable';
import CurrencyForm, { CurrencyFormRef } from '@/components/Currency/CurrencyForm';
import Drawer from '@/components/Drawer/Drawer';
import { toastService } from '@/services/toast.service';
import { currenciesService } from '@/services/currencies.service';
import Pagination from '@/components/Pagination/Pagination';
import DeleteCurrencyModal from '@/components/Currency/DeleteCurrencyModal';
import { Btn } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<CurrencyFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchCurrencies = async (page: number) => {
    try {
      setLoading(true);
      const response = await currenciesService.getCurrencies(page);
      setCurrencies(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error('Error fetching currencies:', err);
      toastService.error("Error al cargar las monedas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCurrencies(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!currencyToDelete) return;

    try {
      await currenciesService.deleteCurrency(currencyToDelete.id);
      toastService.success('Moneda eliminada correctamente');
      fetchCurrencies(currentPage);
      setCurrencyToDelete(null);
    } catch {
      toastService.error('Error al eliminar la moneda');
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingCurrency(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchCurrencies(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCurrencies(page);
  };

  const openDeleteModal = (currency: Currency) => {
    setCurrencyToDelete(currency);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: `rgb(var(--color-primary-500))` }}
        ></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          Monedas
        </h1>
        <Btn
          onClick={() => {
            setEditingCurrency(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nueva Moneda
        </Btn>
      </div>

      {currencies && currencies.length === 0 ? (
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            No hay monedas
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            Haz clic en &quot;Nueva Moneda&quot; para agregar una.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CurrencyTable
              currencies={currencies}
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

      <Drawer
        id="currency-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingCurrency ? 'Editar Moneda' : 'Nueva Moneda'}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <CurrencyForm
          ref={formRef}
          initialData={editingCurrency}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      <DeleteCurrencyModal
        currency={currencyToDelete}
        onClose={() => setCurrencyToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 