'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { quotationService } from '@/services/quotations.service';
import { toastService } from '@/services/toast.service';
import { Quotation } from '@/types/quotation';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import QuotationTable from '@/components/Quotation/QuotationTable';
import QuotationForm, { QuotationFormRef } from '@/components/Quotation/QuotationForm';
import Drawer from '@/components/Drawer/Drawer';
import Pagination from '@/components/Pagination/Pagination';
import ColumnSelector from '@/components/Table/ColumnSelector';
import { useRouter } from 'next/navigation';
import { Btn } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';

const QuotationListPage = () => {
  const t = useTranslations('pages.quotations');
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const quotationFormRef = useRef<QuotationFormRef>(null);
  const initialFetchDone = useRef(false);

  // Column visibility
  const defaultColumns = ['code', 'date', 'validUntil', 'client', 'total', 'status', 'actions'];
  const { visibleColumns, toggleColumn } = useColumnPersistence('quotations-columns', defaultColumns);

  const availableColumns = [
    { key: 'code', label: t('table.code') },
    { key: 'date', label: t('table.date') },
    { key: 'validUntil', label: t('table.validUntil') },
    { key: 'client', label: t('table.client') },
    { key: 'warehouse', label: t('table.warehouse') },
    { key: 'total', label: t('table.total') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions') },
  ];

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      loadQuotations();
    }
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotations(currentPage);
      setQuotations(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedQuotation(null);
    setShowDrawer(true);
  };

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDrawer(true);
  };

  const handleView = (quotation: Quotation) => {
    router.push(`/dashboard/cotizaciones/${quotation.id}`);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setSelectedQuotation(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    loadQuotations();
    toastService.success(
      selectedQuotation ? t('messages.updateSuccess') : t('messages.createSuccess')
    );
  };

  const handleSave = () => {
    if (quotationFormRef.current) {
      quotationFormRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadQuotations();
  };

  const filteredQuotations = quotations.filter(quotation =>
    quotation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.client.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        <Btn
          onClick={handleCreate}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('actions.create')}
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : quotations && quotations.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {t('noQuotations')}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t('noQuotationsDesc')}
          </p>
        </div>
      ) : (
        <>
          {/* Search and Column Selector */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ColumnSelector
              columns={availableColumns}
              visibleColumns={visibleColumns}
              onChange={toggleColumn}
            />
          </div>

          {/* Table */}
          <div className="mt-6">
            <QuotationTable
              quotations={filteredQuotations}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={loadQuotations}
              visibleColumns={visibleColumns}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      <Drawer
        id="quotation-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedQuotation ? t('actions.edit') : t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <QuotationForm
          ref={quotationFormRef}
          quotation={selectedQuotation}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>
    </div>
  );
};

export default QuotationListPage;