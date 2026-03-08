/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Reception, ReceptionCloseResponse } from '@/types/reception';
import { receptionService } from '@/services/receptions.service';
import { toastService } from '@/services/toast.service';
import { ReceptionPDFService } from '@/services/reception-pdf.service';
import ReceptionTable from '@/components/Reception/ReceptionTable';
import ReceptionForm from '@/components/Reception/ReceptionForm';
import DeleteReceptionModal from '@/components/Reception/DeleteReceptionModal';
import CloseReceptionModal from '@/components/Reception/CloseReceptionModal';
import ReceptionCloseResultModal from '@/components/Reception/ReceptionCloseResultModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { ReceptionFormRef } from '@/components/Reception/ReceptionForm';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import ExportButton from '@/components/atoms/ExportButton';
import AdvancedFilters from '@/components/atoms/AdvancedFilters';
import ColumnSelector from '@/components/Table/ColumnSelector';
import BulkActionsBar from '@/components/atoms/BulkActionsBar';
import { useBulkSelection, BulkAction } from '@/hooks/useBulkSelection';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';

export default function RecepcionesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.receptions');
  const tCommon = useTranslations('common');
  const tPdf = useTranslations('pages.receptions.pdf');
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [receptionToDelete, setReceptionToDelete] = useState<Reception | null>(null);
  const [receptionToClose, setReceptionToClose] = useState<Reception | null>(null);
  const [isClosingReception, setIsClosingReception] = useState(false);
  const [closeResult, setCloseResult] = useState<ReceptionCloseResponse | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasInitialData, setHasInitialData] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const formRef = useRef<ReceptionFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: 'code', label: t('table.code') },
    { key: 'date', label: t('table.date') },
    { key: 'provider', label: t('table.provider') },
    { key: 'warehouse', label: t('table.warehouse') },
    { key: 'document', label: t('table.document') },
    { key: 'amount', label: t('table.amount') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'receptions_table',
    availableColumns.map(c => c.key)
  );

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    hasSelection,
  } = useBulkSelection(receptions.map(r => ({ ...r, id: r.id })));

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: tCommon('actions.delete'),
      color: 'danger',
      requiresConfirm: true,
      onClick: async () => {
        try {
          await receptionService.deleteReceptions(selectedIds);
          toastService.success(t('messages.deleteSuccess'));
          clearSelection();
          fetchReceptions(currentPage, searchTerm);
        } catch (error) {
          console.error('Error deleting receptions:', error);
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('messages.errorDeleting'));
          }
        }
      },
    },
  ];

  const fetchReceptions = async (page: number, term?: string, currentFilters?: Record<string, any>) => {
    try {
      setLoading(true);
      const activeFilters = currentFilters || filters;
      const isOpen = activeFilters.status === 'open' ? true : activeFilters.status === 'closed' ? false : undefined;
      
      const response = await receptionService.getReceptions(page, term, isOpen);
      setReceptions(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchReceptions(1);
    }
  }, []);

  const handleDelete = async () => {
    if (!receptionToDelete) return;

    try {
      await receptionService.deleteReception(receptionToDelete.id);
      fetchReceptions(currentPage, searchTerm);
      setReceptionToDelete(null);
    } catch (error) {
      setReceptionToDelete(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    }
  };

  const handleClose = async () => {
    if (!receptionToClose) return;

    try {
      setIsClosingReception(true);
      const result = await receptionService.closeReception(receptionToClose.id);
      setCloseResult(result);
      fetchReceptions(currentPage, searchTerm);
      setReceptionToClose(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorClosing'));
      }
    } finally {
      setIsClosingReception(false);
    }
  };

  const handleGeneratePDF = async (reception: Reception) => {
    try {
      setIsGeneratingPDF(true);
      
      // Obtener los detalles de la recepción
      const detailsResponse = await receptionService.getReceptionDetails(reception.id);
      const details = detailsResponse.data || [];
      
      // Preparar traducciones para el PDF
      const translations = {
        title: t('messages.pdfTitle'),
        code: tPdf('code'),
        date: tPdf('date'),
        provider: tPdf('provider'),
        warehouse: tPdf('warehouse'),
        document: tPdf('document'),
        status: tPdf('status'),
        product: tPdf('product'),
        sku: tPdf('sku'),
        brand: tPdf('brand'),
        category: tPdf('category'),
        quantity: tPdf('quantity'),
        price: tPdf('price'),
        subtotal: tPdf('subtotal'),
        total: tPdf('total'),
        footer: t('messages.pdfFooter'),
        statusOpen: tPdf('statusOpen'),
        statusClosed: tPdf('statusClosed'),
        page: tPdf('page')
      };
      
      // Generar el PDF usando el nuevo servicio
      const pdfService = new ReceptionPDFService(locale);
      pdfService.generatePDF(reception, details, translations);
      
      toastService.success(t('messages.pdfGenerated'));
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorGeneratingPDF'));
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDetails = (reception: Reception) => {
    router.push(`/${locale}/dashboard/recepciones/recepciones/${reception.id}`);
  };

  const handleEdit = (reception: Reception) => {
    setEditingReception(reception);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingReception(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchReceptions(currentPage, searchTerm);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (reception: Reception) => {
    setReceptionToDelete(reception);
  };

  const openCloseModal = (reception: Reception) => {
    setReceptionToClose(reception);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReceptions(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        <Btn
          onClick={() => {
            setEditingReception(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('newReception')}
        </Btn>
      </div>

      {/* Filtros y búsqueda */}
      {(receptions.length > 0 || searchTerm) && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={t('searchReceptions')}
              onSearch={(term: string) => {
                setSearchTerm(term);
                fetchReceptions(1, term);
              }}
            />
          </div>
          {receptions && receptions.length > 0 && (
            <>
              <ExportButton
                data={receptions}
                filename="receptions"
                columns={['code', 'date', 'provider', 'warehouse', 'document', 'amount', 'status']}
              />
              <AdvancedFilters
                fields={[
                  {
                    key: 'status',
                    label: t('table.status'),
                    type: 'select',
                    options: [
                      { value: 'open', label: t('status.open') },
                      { value: 'closed', label: t('status.closed') },
                    ],
                  },
                ]}
                onApply={(newFilters) => {
                  setFilters(newFilters);
                  fetchReceptions(1, searchTerm, newFilters);
                }}
                storageKey="reception-advanced-filters"
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : receptions && receptions.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noReceptions')}
          description={t('noReceptionsDesc')}
          searchDescription={t('noResultsDesc')}
        />
      ) : (
        <>
          <div className="mt-6">
            <ReceptionTable
              receptions={receptions}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleDetails}
              onClose={openCloseModal}
              onGeneratePDF={handleGeneratePDF}
              visibleColumns={visibleColumns}
              selectedIds={selectedIds}
              onSelectChange={toggleSelect}
              onSelectAllChange={toggleSelectAll}
            />
          </div>

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

      {/* Drawer para crear/editar recepciones */}
      <Drawer
        id="reception-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingReception ? t('editReception') : t('newReception')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <ReceptionForm
          ref={formRef}
          reception={editingReception}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal para eliminar recepción */}
      <DeleteReceptionModal
        reception={receptionToDelete}
        onClose={() => setReceptionToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Modal para cerrar recepción */}
      <CloseReceptionModal
        isOpen={!!receptionToClose}
        reception={receptionToClose}
        onClose={() => setReceptionToClose(null)}
        onConfirm={handleClose}
        isLoading={isClosingReception}
      />

      {/* Modal para mostrar resultado del cierre */}
      {closeResult && (
        <ReceptionCloseResultModal
          closeResult={closeResult}
          onClose={() => setCloseResult(null)}
        />
      )}

      {/* Barra de acciones masivas */}
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