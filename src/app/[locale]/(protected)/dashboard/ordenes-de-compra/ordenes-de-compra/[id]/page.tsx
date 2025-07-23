'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PurchaseOrder, PurchaseOrderDetail } from '@/types/purchase-order';
import { purchaseOrdersService } from '@/services';
import { toastService } from '@/services';
import PurchaseOrderProductsTable from '@/components/PurchaseOrder/PurchaseOrderProductsTable';
import AddProductForm, { AddProductFormRef } from '@/components/PurchaseOrder/AddProductForm';
import DeleteProductModal from '@/components/PurchaseOrder/DeleteProductModal';
import ApprovePurchaseOrderModal from '@/components/PurchaseOrder/ApprovePurchaseOrderModal';
import Drawer from '@/components/Drawer/Drawer';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddProductDrawer, setShowAddProductDrawer] = useState(false);
  const [productToEdit, setProductToEdit] = useState<PurchaseOrderDetail | null>(null);
  const [productToDelete, setProductToDelete] = useState<PurchaseOrderDetail | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isProductFormValid, setIsProductFormValid] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const productFormRef = useRef<AddProductFormRef>(null);

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

  const handleAddProductDrawerClose = () => {
    setShowAddProductDrawer(false);
    setProductToEdit(null);
    setIsSavingProduct(false);
  };

  const handleEditProductDrawerClose = () => {
    setShowAddProductDrawer(false);
    setProductToEdit(null);
    setIsSavingProduct(false);
  };

  const handleAddProductFormSuccess = () => {
    handleAddProductDrawerClose();
    fetchProducts();
  };

  const handleEditProductFormSuccess = () => {
    handleEditProductDrawerClose();
    fetchProducts();
  };

  const handleAddProductSave = async () => {
    if (productFormRef.current) {
      const formData = await productFormRef.current.submit();
      if (formData) {
        try {
          setIsSavingProduct(true);
          await purchaseOrdersService.createPurchaseOrderDetail(purchaseOrderId, formData);
          toastService.success(t('addProduct.messages.productAdded'));
          handleAddProductDrawerClose();
          fetchProducts();
        } catch (error) {
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('addProduct.messages.errorAdding'));
          }
        } finally {
          setIsSavingProduct(false);
        }
      }
    }
  };

  const handleEditProductSave = async () => {
    if (productFormRef.current && productToEdit) {
      const formData = await productFormRef.current.submit();
      if (formData) {
        try {
          setIsSavingProduct(true);
          await purchaseOrdersService.updatePurchaseOrderDetail(purchaseOrderId, productToEdit.id, formData);
          toastService.success(t('addProduct.messages.productUpdated'));
          handleEditProductDrawerClose();
          fetchProducts();
        } catch (error) {
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('addProduct.messages.errorUpdating'));
          }
        } finally {
          setIsSavingProduct(false);
        }
      }
    }
  };

  const handleApproveOrder = () => {
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!purchaseOrder) return;

    try {
      await purchaseOrdersService.approvePurchaseOrder(purchaseOrderId);
      toastService.success(t('approveOrder.success'));
      fetchPurchaseOrder(); // Refresh purchase order status
      setShowApproveModal(false);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('approveOrder.error'));
      }
    }
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

  const isOrderEditable = (status: string) => {
    return ['PENDING', 'APPROVED'].includes(status);
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
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('error.purchaseOrderNotFound')}
          </h2>
          <Btn
            onClick={() => router.push(`/${locale}/dashboard/ordenes-de-compra`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('actions.back')}
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/ordenes-de-compra`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('actions.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { name: purchaseOrder.code })}
            </h1>
            <p className="text-sm text-gray-600">{t('details.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!loadingProducts && products.length > 0 && (
            <Btn
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => {
                setProductToEdit(null);
                setShowAddProductDrawer(true);
              }}
              disabled={!can(["purchase_order_detail_create"]) || !isOrderEditable(purchaseOrder.status)}
            >
              {t('details.addProduct')}
            </Btn>
          )}
          {purchaseOrder.status === 'PENDING' && can(["purchase_order_approve"]) && (
            <Btn
              variant="danger"
              leftIcon={<CheckCircleIcon className="h-5 w-5" />}
              onClick={handleApproveOrder}
            >
              {t('actions.approve')}
            </Btn>
          )}
        </div>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.generalInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.code')}:</span>
              <p className="text-sm text-gray-900">{purchaseOrder.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.date')}:</span>
              <p className="text-sm text-gray-900">{formatDate(purchaseOrder.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.status')}:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}
              >
                {getStatusText(purchaseOrder.status)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.expectedDeliveryDate')}:</span>
              <p className="text-sm text-gray-900">{formatDate(purchaseOrder.expected_delivery_date)}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">{t('details.labels.amount')}:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(purchaseOrder.amount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.provider')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.name')}:</span>
              <p className="text-sm text-gray-900">{purchaseOrder.provider.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.document')}:</span>
              <p className="text-sm text-gray-900">{purchaseOrder.document}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.warehouse')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.name')}:</span>
              <p className="text-sm text-gray-900">{purchaseOrder.warehouse.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas - en una fila separada si existen */}
      {purchaseOrder.notes && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
              {t('details.labels.notes')}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-900">{purchaseOrder.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="py-4 border-gray-200">
        <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
          {t('details.productsTable.title')}
        </h3>
      </div>
      
      <div className="mb-6">
        {loadingProducts ? (
          <div className="flex justify-center items-center h-32">
            <Loading className="h-6 w-6" />
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
        
        {/* Botón de agregar producto - solo visible cuando la colección está vacía */}
        {!loadingProducts && products.length === 0 && (
          <div className="mt-6 text-center">
            <Btn
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => {
                setProductToEdit(null);
                setShowAddProductDrawer(true);
              }}
              disabled={!can(["purchase_order_detail_create"]) || !isOrderEditable(purchaseOrder.status)}
            >
              {t('details.addProduct')}
            </Btn>
            {(!can(["purchase_order_detail_create"]) || !isOrderEditable(purchaseOrder.status)) && (
              <p className="text-sm text-gray-500 mt-2">
                {!can(["purchase_order_detail_create"]) 
                  ? "No tienes permisos para agregar productos" 
                  : "La orden no está en estado editable"
                }
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawer para agregar productos */}
      <Drawer
        id="add-product-drawer"
        isOpen={showAddProductDrawer && !productToEdit}
        onClose={handleAddProductDrawerClose}
        title={t('addProduct.title')}
        onSave={handleAddProductSave}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          ref={productFormRef}
          onClose={handleAddProductDrawerClose}
          onSuccess={handleAddProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Drawer para editar productos */}
      <Drawer
        id="edit-product-drawer"
        isOpen={showAddProductDrawer && !!productToEdit}
        onClose={handleEditProductDrawerClose}
        title={t('editProduct.title')}
        onSave={handleEditProductSave}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          ref={productFormRef}
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

      {/* Modal para confirmar aprobación */}
      <ApprovePurchaseOrderModal
        purchaseOrder={showApproveModal ? purchaseOrder : null}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
} 