/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Sale, SaleCloseResponse, SaleDetail } from '@/types/sale';
import { saleService } from '@/services/sales.service';
import { toastService } from '@/services/toast.service';
import { PDFService } from '@/services/pdf.service';
import SaleTable from '@/components/Sale/SaleTable';
import SaleForm from '@/components/Sale/SaleForm';
import DeleteSaleModal from '@/components/Sale/DeleteSaleModal';
import CloseSaleModal from '@/components/Sale/CloseSaleModal';
import SaleCloseResultModal from '@/components/Sale/SaleCloseResultModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { SaleFormRef } from '@/components/Sale/SaleForm';
import { Btn } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';

export default function VentasPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.sales');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [saleToClose, setSaleToClose] = useState<Sale | null>(null);
  const [isClosingSale, setIsClosingSale] = useState(false);
  const [closeResult, setCloseResult] = useState<SaleCloseResponse | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const formRef = useRef<SaleFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchSales = async (page: number) => {
    try {
      setLoading(true);
      const response = await saleService.getSales(page);
      setSales(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
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
      fetchSales(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!saleToDelete) return;

    try {
      await saleService.deleteSale(saleToDelete.id);
      fetchSales(currentPage);
      setSaleToDelete(null);
    } catch (error) {
      setSaleToDelete(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    }
  };

  const handleClose = async () => {
    if (!saleToClose) return;

    try {
      setIsClosingSale(true);
      const result = await saleService.closeSale(saleToClose.id);
      setCloseResult(result);
      fetchSales(currentPage);
      setSaleToClose(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorClosing'));
      }
    } finally {
      setIsClosingSale(false);
    }
  };

  const handleGeneratePDF = async (sale: Sale) => {
    try {
      setIsGeneratingPDF(true);
      
      // Obtener los detalles de la venta
      const detailsResponse = await saleService.getSaleDetails(sale.id);
      const details = detailsResponse.data || [];
      
      // Generar el PDF usando la venta completa y los detalles
      const pdfService = new PDFService();
      pdfService.generateSalePDF(sale, details, {
        filename: `sale-${sale.code}.pdf`
      });
      
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

  const handleDetails = (sale: Sale) => {
    router.push(`/${locale}/dashboard/ventas/ventas/${sale.id}`);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingSale(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchSales(currentPage);
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const openDeleteModal = (sale: Sale) => {
    setSaleToDelete(sale);
  };

  const openCloseModal = (sale: Sale) => {
    setSaleToClose(sale);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSales(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        <Btn
          onClick={() => {
            setEditingSale(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('newSale')}
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : sales && sales.length === 0 ? (
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {t('noSales')}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t('noSalesDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SaleTable
              sales={sales}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleDetails}
              onClose={openCloseModal}
              onGeneratePDF={handleGeneratePDF}
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

      {/* Drawer para crear/editar ventas */}
      <Drawer
        id="sale-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingSale ? t('editSale') : t('newSale')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <SaleForm
          ref={formRef}
          sale={editingSale}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal para eliminar venta */}
      <DeleteSaleModal
        sale={saleToDelete}
        onClose={() => setSaleToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Modal para cerrar venta */}
      <CloseSaleModal
        isOpen={!!saleToClose}
        sale={saleToClose}
        onClose={() => setSaleToClose(null)}
        onConfirm={handleClose}
        isLoading={isClosingSale}
      />

      {/* Modal para mostrar resultado del cierre */}
      {closeResult && (
        <SaleCloseResultModal
          closeResult={closeResult}
          onClose={() => setCloseResult(null)}
        />
      )}
    </div>
  );
} 