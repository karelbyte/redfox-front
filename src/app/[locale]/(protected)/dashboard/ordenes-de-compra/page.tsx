/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PurchaseOrder, PurchaseOrderApprovalResponse, PurchaseOrderRejectionResponse, PurchaseOrderCancellationResponse } from '@/types/purchase-order';
import { purchaseOrdersService } from '@/services';
import { toastService } from '@/services';
import { PDFService } from '@/services';
import PurchaseOrderTable from '@/components/PurchaseOrder/PurchaseOrderTable';
import PurchaseOrderForm from '@/components/PurchaseOrder/PurchaseOrderForm';
import DeletePurchaseOrderModal from '@/components/PurchaseOrder/DeletePurchaseOrderModal';
import ApprovePurchaseOrderModal from '@/components/PurchaseOrder/ApprovePurchaseOrderModal';
import RejectPurchaseOrderModal from '@/components/PurchaseOrder/RejectPurchaseOrderModal';
import CancelPurchaseOrderModal from '@/components/PurchaseOrder/CancelPurchaseOrderModal';
import PurchaseOrderApprovalResultModal from '@/components/PurchaseOrder/PurchaseOrderApprovalResultModal';
import PurchaseOrderRejectionResultModal from '@/components/PurchaseOrder/PurchaseOrderRejectionResultModal';
import PurchaseOrderCancellationResultModal from '@/components/PurchaseOrder/PurchaseOrderCancellationResultModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { PurchaseOrderFormRef } from '@/components/PurchaseOrder/PurchaseOrderForm';
import { Btn } from '@/components/atoms';
import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.purchaseOrders');
  const { can } = usePermissions();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [purchaseOrderToDelete, setPurchaseOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [purchaseOrderToApprove, setPurchaseOrderToApprove] = useState<PurchaseOrder | null>(null);
  const [purchaseOrderToReject, setPurchaseOrderToReject] = useState<PurchaseOrder | null>(null);
  const [purchaseOrderToCancel, setPurchaseOrderToCancel] = useState<PurchaseOrder | null>(null);
  const [approvalResult, setApprovalResult] = useState<PurchaseOrderApprovalResponse | null>(null);
  const [rejectionResult, setRejectionResult] = useState<PurchaseOrderRejectionResponse | null>(null);
  const [cancellationResult, setCancellationResult] = useState<PurchaseOrderCancellationResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const formRef = useRef<PurchaseOrderFormRef>(null);
  const initialFetchDone = useRef(false);

  const fetchPurchaseOrders = async (page: number) => {
    try {
      setLoading(true);
      const response = await purchaseOrdersService.getPurchaseOrders({ page });
      setPurchaseOrders(response.data || []);
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
      fetchPurchaseOrders(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!purchaseOrderToDelete) return;

    try {
      await purchaseOrdersService.deletePurchaseOrder(purchaseOrderToDelete.id);
      fetchPurchaseOrders(currentPage);
      setPurchaseOrderToDelete(null);
    } catch (error) {
      setPurchaseOrderToDelete(null);
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    }
  };

  const handleApprove = async () => {
    if (!purchaseOrderToApprove) return;

    try {
      const result = await purchaseOrdersService.approvePurchaseOrder(purchaseOrderToApprove.id);
      setApprovalResult(result);
      fetchPurchaseOrders(currentPage);
      setPurchaseOrderToApprove(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorApproving'));
      }
    }
  };

  const handleReject = async () => {
    if (!purchaseOrderToReject) return;

    try {
      const result = await purchaseOrdersService.rejectPurchaseOrder(purchaseOrderToReject.id);
      setRejectionResult(result);
      fetchPurchaseOrders(currentPage);
      setPurchaseOrderToReject(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorRejecting'));
      }
    }
  };

  const handleCancel = async () => {
    if (!purchaseOrderToCancel) return;

    try {
      const result = await purchaseOrdersService.cancelPurchaseOrder(purchaseOrderToCancel.id);
      setCancellationResult(result);
      fetchPurchaseOrders(currentPage);
      setPurchaseOrderToCancel(null);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorCancelling'));
      }
    }
  };

  const handleGeneratePDF = async (purchaseOrder: PurchaseOrder) => {
    try {
      setIsGeneratingPDF(true);
      
      // Obtener los detalles de la orden de compra
      const detailsResponse = await purchaseOrdersService.getPurchaseOrderDetails(purchaseOrder.id);
      const details = detailsResponse.data || [];
      
      // Generar el PDF usando la orden completa y los detalles
      const pdfService = new PDFService();
      pdfService.generatePurchaseOrderPDF(purchaseOrder, details, {
        filename: `purchase-order-${purchaseOrder.code}.pdf`
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

  const handleDetails = (purchaseOrder: PurchaseOrder) => {
    router.push(`/${locale}/dashboard/ordenes-de-compra/ordenes-de-compra/${purchaseOrder.id}`);
  };

  const handleEdit = (purchaseOrder: PurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingPurchaseOrder(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchPurchaseOrders(currentPage);
  };

  const handleSave = async () => {
    if (formRef.current) {
      const formData = await formRef.current.submit();
      if (formData) {
        try {
          setIsSaving(true);
          if (editingPurchaseOrder) {
            // Actualizar orden existente
            await purchaseOrdersService.updatePurchaseOrder(editingPurchaseOrder.id, formData);
            toastService.success(t('messages.purchaseOrderUpdated'));
          } else {
            // Crear nueva orden
            await purchaseOrdersService.createPurchaseOrder(formData);
            toastService.success(t('messages.purchaseOrderCreated'));
          }
          handleFormSuccess();
        } catch (error) {
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(editingPurchaseOrder ? t('messages.errorUpdating') : t('messages.errorCreating'));
          }
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const openDeleteModal = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrderToDelete(purchaseOrder);
  };

  const openApproveModal = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrderToApprove(purchaseOrder);
  };

  const openRejectModal = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrderToReject(purchaseOrder);
  };

  const openCancelModal = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrderToCancel(purchaseOrder);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPurchaseOrders(page);
  };

  if (!can(["purchase_order_module_view"])) {
    return <div>{t('noPermissionDesc')}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        {can(["purchase_order_create"]) && (
          <Btn
            onClick={() => {
              setEditingPurchaseOrder(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('actions.create')}
          </Btn>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : purchaseOrders && purchaseOrders.length === 0 ? (
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
            {t('noPurchaseOrders')}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t('noPurchaseOrdersDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <PurchaseOrderTable
              purchaseOrders={purchaseOrders}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDetails={handleDetails}
              onApprove={openApproveModal}
              onReject={openRejectModal}
              onCancel={openCancelModal}
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

      {/* Drawer para crear/editar órdenes de compra */}
      <Drawer
        id="purchase-order-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingPurchaseOrder ? t('actions.edit') : t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <PurchaseOrderForm
          ref={formRef}
          purchaseOrder={editingPurchaseOrder}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Modal para eliminar orden de compra */}
      <DeletePurchaseOrderModal
        purchaseOrder={purchaseOrderToDelete}
        onClose={() => setPurchaseOrderToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Modal para aprobar orden de compra */}
      <ApprovePurchaseOrderModal
        purchaseOrder={purchaseOrderToApprove}
        onClose={() => setPurchaseOrderToApprove(null)}
        onConfirm={handleApprove}
      />

      {/* Modal para rechazar orden de compra */}
      <RejectPurchaseOrderModal
        purchaseOrder={purchaseOrderToReject}
        onClose={() => setPurchaseOrderToReject(null)}
        onConfirm={handleReject}
      />

      {/* Modal para cancelar orden de compra */}
      <CancelPurchaseOrderModal
        purchaseOrder={purchaseOrderToCancel}
        onClose={() => setPurchaseOrderToCancel(null)}
        onConfirm={handleCancel}
      />

      {/* Modal para mostrar resultado de aprobación */}
      <PurchaseOrderApprovalResultModal
        isOpen={!!approvalResult}
        onClose={() => setApprovalResult(null)}
        result={approvalResult}
      />

      {/* Modal para mostrar resultado de rechazo */}
      <PurchaseOrderRejectionResultModal
        isOpen={!!rejectionResult}
        onClose={() => setRejectionResult(null)}
        result={rejectionResult}
      />

      {/* Modal para mostrar resultado de cancelación */}
      <PurchaseOrderCancellationResultModal
        isOpen={!!cancellationResult}
        onClose={() => setCancellationResult(null)}
        result={cancellationResult}
      />
    </div>
  );
} 