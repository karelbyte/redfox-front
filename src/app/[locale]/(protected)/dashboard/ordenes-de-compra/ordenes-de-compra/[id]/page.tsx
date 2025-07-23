'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PurchaseOrder, PurchaseOrderDetail } from '@/types/purchase-order';
import { purchaseOrdersService } from '@/services';
import { toastService } from '@/services';
import { PDFService } from '@/services';
import PurchaseOrderProductsTable from '@/components/PurchaseOrder/PurchaseOrderProductsTable';
import AddProductForm from '@/components/PurchaseOrder/AddProductForm';
import DeleteProductModal from '@/components/PurchaseOrder/DeleteProductModal';
import Drawer from '@/components/Drawer/Drawer';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

export default function PurchaseOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.purchaseOrders');
  const { can } = usePermissions();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [products, setProducts] = useState<PurchaseOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddProductDrawer, setShowAddProductDrawer] = useState(false);
  const [productToEdit, setProductToEdit] = useState<PurchaseOrderDetail | null>(null);
  const [productToDelete, setProductToDelete] = useState<PurchaseOrderDetail | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isProductFormValid, setIsProductFormValid] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const purchaseOrderId = params.id as string;

  const fetchPurchaseOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await purchaseOrdersService.getPurchaseOrder(purchaseOrderId);
      setPurchaseOrder(response);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('error.purchaseOrderNotFound'));
      }
      router.push(`/${locale}/dashboard/ordenes-de-compra`);
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, router, locale, t]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await purchaseOrdersService.getPurchaseOrderDetails(purchaseOrderId);
      setProducts(response.data || []);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorLoading'));
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [purchaseOrderId, t]);

  useEffect(() => {
    if (purchaseOrderId) {
      fetchPurchaseOrder();
      fetchProducts();
    }
  }, [purchaseOrderId, fetchPurchaseOrder, fetchProducts]);



  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await purchaseOrdersService.deletePurchaseOrderDetail(purchaseOrderId, productToDelete.id);
      fetchProducts();
      setProductToDelete(null);
      toastService.success(t('deleteProduct.success'));
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('deleteProduct.error'));
      }
    }
  };

  const handleGeneratePDF = async () => {
    if (!purchaseOrder) return;

    try {
      setIsGeneratingPDF(true);
      
      // Obtener los detalles de la orden de compra
      const detailsResponse = await purchaseOrdersService.getPurchaseOrderDetails(purchaseOrderId);
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

  const handleEditProductDrawerClose = () => {
    setShowAddProductDrawer(false);
    setProductToEdit(null);
    setIsSavingProduct(false);
  };

  const handleEditProductFormSuccess = () => {
    handleEditProductDrawerClose();
    fetchProducts();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('status.pending');
      case 'APPROVED':
        return t('status.approved');
      case 'REJECTED':
        return t('status.rejected');
      case 'CANCELLED':
        return t('status.cancelled');
      case 'COMPLETED':
        return t('status.completed');
      default:
        return status;
    }
  };

  if (!can(["purchase_order_module_view"])) {
    return <div>{t('noPermissionDesc')}</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return <div>{t('error.purchaseOrderNotFound')}</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/ordenes-de-compra`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('actions.back')}
          </Btn>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { name: purchaseOrder.code })}
            </h1>
            <p className="text-sm text-gray-600">{t('details.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Btn
            variant="outline"
            onClick={handleGeneratePDF}
            leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? t('actions.generatingPDF') : t('actions.generatePDF')}
          </Btn>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
              {t('details.generalInfo')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.code')}</label>
                <p className="text-sm text-gray-900">{purchaseOrder.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.date')}</label>
                <p className="text-sm text-gray-900">{formatDate(purchaseOrder.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.provider')}</label>
                <p className="text-sm text-gray-900">{purchaseOrder.provider.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.warehouse')}</label>
                <p className="text-sm text-gray-900">{purchaseOrder.warehouse.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.document')}</label>
                <p className="text-sm text-gray-900">{purchaseOrder.document}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.expectedDeliveryDate')}</label>
                <p className="text-sm text-gray-900">{formatDate(purchaseOrder.expected_delivery_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.status')}</label>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}
                >
                  {getStatusText(purchaseOrder.status)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('details.labels.amount')}</label>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(purchaseOrder.amount)}</p>
              </div>
              {purchaseOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('details.labels.notes')}</label>
                  <p className="text-sm text-gray-900">{purchaseOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
                  {t('products.title')}
                </h3>
                {can(["purchase_order_detail_create"]) && (
                  <Btn
                    onClick={() => {
                      setProductToEdit(null);
                      setShowAddProductDrawer(true);
                    }}
                    size="sm"
                  >
                    {t('details.addProduct')}
                  </Btn>
                )}
              </div>
            </div>
            <div className="p-6">
              {loadingProducts ? (
                <div className="flex justify-center items-center h-32">
                  <Loading size="md" />
                </div>
              ) : (
                <PurchaseOrderProductsTable
                  products={products}
                  onEdit={(product) => {
                    setProductToEdit(product);
                    setShowAddProductDrawer(true);
                  }}
                  onDelete={(product) => setProductToDelete(product)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer para agregar/editar productos */}
      <Drawer
        id="add-product-drawer"
        isOpen={showAddProductDrawer}
        onClose={handleEditProductDrawerClose}
        title={productToEdit ? t('addProduct.editTitle') : t('addProduct.title')}
        onSave={() => {
          // La lógica de guardado se maneja en el formulario
        }}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          purchaseOrderDetail={productToEdit}
          onClose={handleEditProductDrawerClose}
          onSuccess={handleEditProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Modal para eliminar producto */}
      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
} 