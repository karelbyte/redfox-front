/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Sale, SaleCloseResponse } from '@/types/sale';
import { Client } from '@/types/client';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { invoiceService } from '@/services';
import { toastService } from '@/services/toast.service';
import { ticketPrinterService } from '@/services/ticket-printer.service';
import SaleTable from '@/components/Sale/SaleTable';
import DeleteSaleModal from '@/components/Sale/DeleteSaleModal';
import CloseSaleModal from '@/components/Sale/CloseSaleModal';
import RefundSaleModal from '@/components/Sale/RefundSaleModal';
import SaleCloseResultModal from '@/components/Sale/SaleCloseResultModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import SaleForm, { SaleFormRef } from '@/components/Sale/SaleForm';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import ColumnSelector from '@/components/Table/ColumnSelector';

export default function ClientSalesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const clientId = params.id as string;
  const t = useTranslations('pages.sales');
  const tClient = useTranslations('pages.clients');
  const tPos = useTranslations('pages.pos');
  const [sales, setSales] = useState<Sale[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [saleToClose, setSaleToClose] = useState<Sale | null>(null);
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null);
  const [isClosingSale, setIsClosingSale] = useState(false);
  const [isRefundingSale, setIsRefundingSale] = useState(false);
  const [closeResult, setCloseResult] = useState<SaleCloseResponse | null>(null);
  const [isPrintingTicket, setIsPrintingTicket] = useState(false);
  const formRef = useRef<SaleFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: 'code', label: t('table.code') },
    { key: 'date', label: t('table.date') },
    { key: 'destination', label: t('table.destination') },
    { key: 'amount', label: t('table.amount') },
    { key: 'status', label: t('table.status') },
    { key: 'fiscalStatus', label: t('table.fiscalStatus') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'client_sales_table',
    availableColumns.map(c => c.key)
  );

  const fetchClient = async () => {
    try {
      const response = await clientsService.getClient(clientId);
      setClient(response);
    } catch (error) {
      console.error('Error loading client:', error);
      toastService.error(tClient('messages.errorLoading'));
    }
  };

  const fetchSales = async (page: number) => {
    try {
      setLoading(true);
      const response = await saleService.getSales(page, clientId);
      // Ordenar por fecha descendente
      const sortedSales = (response.data || []).sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setSales(sortedSales);
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
      fetchClient();
      fetchSales(currentPage);
    }
  }, []);

  const handleView = (sale: Sale) => {
    router.push(`/${locale}/dashboard/ventas/ventas/${sale.id}`);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowDrawer(true);
  };

  const handleDelete = async () => {
    if (!saleToDelete) return;

    try {
      await saleService.deleteSale(saleToDelete.id);
      fetchSales(currentPage);
      setSaleToDelete(null);
      toastService.success(t('messages.saleDeleted'));
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

  const handleRefund = async () => {
    if (!saleToRefund) return;

    try {
      setIsRefundingSale(true);
      await saleService.refundSale(saleToRefund.id);
      toastService.success(t('messages.saleRefunded'));
      fetchSales(currentPage);
      setSaleToRefund(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorRefunded'));
      }
    } finally {
      setIsRefundingSale(false);
    }
  };

  const handlePrintTicket = async (sale: Sale) => {
    try {
      setIsPrintingTicket(true);

      const detailsResponse = await saleService.getSaleDetails(sale.id);
      const details = detailsResponse.data || [];

      const ticketData = {
        sale,
        saleDetails: details,
        client: sale.client,
        cashierName: 'POS System',
        paymentMethod: 'cash' as const,
        locale,
        labels: {
          ticket: tPos('ticket.ticket', { default: 'Ticket' }),
          date: tPos('ticket.date', { default: 'Date' }),
          cashier: tPos('ticket.cashier', { default: 'Cashier' }),
          client: tPos('ticket.client', { default: 'Client' }),
          products: tPos('ticket.products', { default: 'PRODUCTS:' }),
          subtotal: tPos('ticket.subtotal', { default: 'Subtotal:' }),
          tax: tPos('ticket.tax', { default: 'Tax:' }),
          total: tPos('ticket.total', { default: 'TOTAL:' }),
          paymentMethod: tPos('ticket.paymentMethod', { default: 'Payment Method:' }),
          cashReceived: tPos('ticket.cashReceived', { default: 'Cash Received:' }),
          change: tPos('ticket.change', { default: 'Change:' }),
          thanks: tPos('ticket.thanks', { default: 'Thank you for your purchase!' }),
          comeBack: tPos('ticket.comeBack', { default: 'Please come back soon' }),
          powered: tPos('ticket.powered', { default: 'Powered by RedFox POS' }),
          walkIn: tPos('ticket.walkIn', { default: 'Walk-in Customer' }),
          posSystem: tPos('ticket.posSystem', { default: 'POS System' }),
        },
      };

      await ticketPrinterService.printTicket(ticketData);
      toastService.success(tPos('messages.ticketPrinted'));
    } catch (error) {
      console.error('Error printing ticket:', error);
      toastService.error(tPos('messages.ticketPrintError'));
    } finally {
      setIsPrintingTicket(false);
    }
  };

  const handleInvoice = async (sale: Sale) => {
    try {
      const invoiceCode = `INV-${sale.code}`;
      const invoice = await invoiceService.convertWithdrawalToInvoice({
        withdrawal_id: sale.id,
        invoice_code: invoiceCode,
        status: 'DRAFT' as any
      });

      toastService.success(t('messages.invoiceCreated'));
      router.push(`/${locale}/dashboard/facturas/facturas/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toastService.error(t('messages.errorCreatingInvoice'));
    }
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

  const openRefundModal = (sale: Sale) => {
    setSaleToRefund(sale);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSales(page);
  };

  const handleBack = () => {
    router.push(`/${locale}/dashboard/clientes`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Btn
              variant="ghost"
              size="sm"
              onClick={handleBack}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              {tClient('actions.back') || 'Volver'}
            </Btn>
            <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('title')}
            </h1>
          </div>
          {client && (
            <p className="text-sm text-gray-600 mt-2 ml-20">
              Cliente: <span className="font-medium">{client.name}</span> ({client.code})
            </p>
          )}
        </div>
        <ColumnSelector
          columns={availableColumns}
          visibleColumns={visibleColumns}
          onChange={toggleColumn}
        />
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
            Este cliente no tiene ventas registradas
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <SaleTable
              sales={sales}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleView}
              onClose={openCloseModal}
              onRefund={openRefundModal}
              onPrintTicket={handlePrintTicket}
              onInvoice={handleInvoice}
              visibleColumns={visibleColumns}
              hideClientColumn={true}
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

      {/* Drawer para editar venta */}
      <Drawer
        id="sale-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={t('editSale')}
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

      {/* Modal para devolver venta */}
      <RefundSaleModal
        isOpen={!!saleToRefund}
        sale={saleToRefund}
        onClose={() => setSaleToRefund(null)}
        onConfirm={handleRefund}
        isLoading={isRefundingSale}
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
