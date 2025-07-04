'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { warehouseAdjustmentService } from '@/services';
import { WarehouseAdjustment, WarehouseAdjustmentDetail } from '@/types/warehouse-adjustment';
import { Btn } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import Loading from '@/components/Loading/Loading';
import WarehouseAdjustmentProductsTable from '@/components/WarehouseAdjustment/WarehouseAdjustmentProductsTable';
import AddProductForm, { AddProductFormRef } from '@/components/WarehouseAdjustment/AddProductForm';
import { CloseWarehouseAdjustmentModal } from '@/components/WarehouseAdjustment/CloseWarehouseAdjustmentModal';
// import WarehouseAdjustmentCloseResultModal from '@/components/WarehouseAdjustment/WarehouseAdjustmentCloseResultModal';
import ConfirmModal from '@/components/Modal/ConfirmModal';
import { toastService } from '@/services/toast.service';

export default function WarehouseAdjustmentDetailsPage() {
  const t = useTranslations('pages.warehouseAdjustments');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const { can } = usePermissions();
  
  const [adjustment, setAdjustment] = useState<WarehouseAdjustment | null>(null);
  const [products, setProducts] = useState<WarehouseAdjustmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAddProductDrawerOpen, setIsAddProductDrawerOpen] = useState(false);
  const [isEditProductDrawerOpen, setIsEditProductDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<WarehouseAdjustmentDetail | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isProductFormValid, setIsProductFormValid] = useState(false);
  const [isClosingAdjustment, setIsClosingAdjustment] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  // const [closeResult, setCloseResult] = useState<WarehouseAdjustmentCloseResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<WarehouseAdjustmentDetail | null>(null);
  const productFormRef = useRef<AddProductFormRef>(null);

  const adjustmentId = params.id as string;

  const fetchAdjustment = async () => {
    try {
      setLoading(true);
      const data = await warehouseAdjustmentService.getWarehouseAdjustmentById(adjustmentId);
      setAdjustment(data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorLoading'));
      }
      router.push(`/${locale}/dashboard/almacenes/ajustes-de-almacen`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!adjustmentId) return;
    
    try {
      setLoadingProducts(true);
      const response = await warehouseAdjustmentService.getWarehouseAdjustmentDetails(adjustmentId, 1);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (adjustmentId && can(['warehouse_adjustment_module_view'])) {
      fetchAdjustment();
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustmentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };



  const handleAddProductDrawerClose = () => {
    setIsAddProductDrawerOpen(false);
    setIsSavingProduct(false);
  };

  const handleEditProductDrawerClose = () => {
    setIsEditProductDrawerOpen(false);
    setProductToEdit(null);
    setIsSavingProduct(false);
  };

  const handleAddProductFormSuccess = () => {
    handleAddProductDrawerClose();
    fetchAdjustment(); // Recargar los datos del ajuste
    fetchProducts(); // Recargar los productos
  };

  const handleEditProductFormSuccess = () => {
    handleEditProductDrawerClose();
    fetchAdjustment(); // Recargar los datos del ajuste
    fetchProducts(); // Recargar los productos
  };

  const handleAddProductSave = async () => {
    if (!productFormRef.current || !adjustment) return;

    try {
      setIsSavingProduct(true);
      const formData = await productFormRef.current.submit();
      
      if (formData) {
        await warehouseAdjustmentService.addProductToWarehouseAdjustment(adjustment.id, formData);
        toastService.success(t('addProduct.messages.productAdded'));
        handleAddProductFormSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('addProduct.messages.errorAdding'));
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEditProductSave = async () => {
    if (!productFormRef.current || !adjustment || !productToEdit) return;

    try {
      setIsSavingProduct(true);
      const formData = await productFormRef.current.submit();
      
      if (formData) {
        await warehouseAdjustmentService.updateWarehouseAdjustmentDetail(adjustment.id, productToEdit.id, formData);
        toastService.success(t('addProduct.messages.productUpdated'));
        handleEditProductFormSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('addProduct.messages.errorUpdating'));
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (detailId: string) => {
    if (!adjustment) return;

    try {
      await warehouseAdjustmentService.deleteWarehouseAdjustmentDetail(adjustment.id, detailId);
      toastService.success(t('deleteProduct.success'));
      fetchAdjustment(); // Recargar los datos del ajuste
      fetchProducts(); // Recargar los productos
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('deleteProduct.error'));
      }
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  const handleEditProduct = (product: WarehouseAdjustmentDetail) => {
    setProductToEdit(product);
    setIsEditProductDrawerOpen(true);
  };

  const handleCloseAdjustment = async () => {
    if (!adjustment) return;

    try {
      setIsClosingAdjustment(true);
      // const result = await warehouseAdjustmentService.closeWarehouseAdjustment(adjustment.id);
      // setCloseResult(result);
      setIsCloseModalOpen(false);
      fetchAdjustment(); // Recargar los datos del ajuste
      fetchProducts(); // Recargar los productos
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorClosing'));
      }
    } finally {
      setIsClosingAdjustment(false);
    }
  };

  const handleCloseAdjustmentModalClose = () => {
    setIsCloseModalOpen(false);
  };

  const handleCloseAdjustmentClick = () => {
    setIsCloseModalOpen(true);
  };

  // const handleCloseResultModalClose = () => {
  //   setCloseResult(null);
  // };



  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await handleDeleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCancelDeleteProduct = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  if (!can(['warehouse_adjustment_module_view'])) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{tCommon('messages.noPermission')}</h1>
          <p className="text-gray-600">{t('messages.noPermissionDesc')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">{t('error.adjustmentNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/almacenes/ajustes-de-almacen`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('actions.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { name: adjustment.code })}
            </h1>
            <p className="text-sm text-gray-500">
              {t('details.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!adjustment.status && (
            <>
              <Btn
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setIsAddProductDrawerOpen(true)}
              >
                {t('addProduct.title')}
              </Btn>
              <Btn
                variant="danger"
                leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                onClick={handleCloseAdjustmentClick}
                loading={isClosingAdjustment}
              >
                {t('actions.close')}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Información del ajuste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.generalInfo')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.code')}:</span>
              <p className="text-sm text-gray-900">{adjustment.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.date')}:</span>
              <p className="text-sm text-gray-900">{formatDate(adjustment.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.status')}:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  adjustment.status ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
              >
                {adjustment.status ? t('status.closed') : t('status.open')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('table.sourceWarehouse')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.name')}:</span>
              <p className="text-sm text-gray-900">{adjustment.sourceWarehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.code')}:</span>
              <p className="text-sm text-gray-900">{adjustment.sourceWarehouse.code}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('table.targetWarehouse')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.name')}:</span>
              <p className="text-sm text-gray-900">{adjustment.targetWarehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('table.code')}:</span>
              <p className="text-sm text-gray-900">{adjustment.targetWarehouse.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="py-4 border-gray-200">
        <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
          {t('products.title')}
        </h3>
      </div>
      
      <div>
        {loadingProducts ? (
          <div className="flex justify-center items-center h-32">
            <Loading className="h-6 w-6" />
          </div>
        ) : (
          <WarehouseAdjustmentProductsTable
            products={products}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            isAdjustmentOpen={!adjustment.status}
          />
        )}
        
        {!adjustment.status && products.length === 0 && !loadingProducts && (
          <div className="mt-6 text-center">
            <Btn
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setIsAddProductDrawerOpen(true)}
            >
              {t('addProduct.title')}
            </Btn>
          </div>
        )}
      </div>

      {/* Drawer para agregar productos */}
      <Drawer
        id="add-product-drawer"
        isOpen={isAddProductDrawerOpen}
        onClose={handleAddProductDrawerClose}
        title={t('addProduct.title')}
        onSave={handleAddProductSave}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          ref={productFormRef}
          sourceWarehouseId={adjustment.sourceWarehouse.id}
          onClose={handleAddProductDrawerClose}
          onSuccess={handleAddProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Drawer para editar productos */}
      <Drawer
        id="edit-product-drawer"
        isOpen={isEditProductDrawerOpen}
        onClose={handleEditProductDrawerClose}
        title={t('addProduct.editTitle')}
        onSave={handleEditProductSave}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          ref={productFormRef}
          adjustmentDetail={productToEdit}
          sourceWarehouseId={adjustment.sourceWarehouse.id}
          onClose={handleEditProductDrawerClose}
          onSuccess={handleEditProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para cerrar ajuste */}
      <CloseWarehouseAdjustmentModal
        isOpen={isCloseModalOpen}
        adjustment={adjustment}
        onClose={handleCloseAdjustmentModalClose}
        onConfirm={handleCloseAdjustment}
      />

      {/* Modal de resultado del cierre de ajuste */}
      {/* <WarehouseAdjustmentCloseResultModal
        closeResult={closeResult}
        onClose={handleCloseResultModalClose}
      /> */}

      {/* Modal de confirmación para eliminar producto */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDeleteProduct}
        onConfirm={handleConfirmDeleteProduct}
        title={t('deleteProduct.title')}
        message={t('deleteProduct.message', { 
          productName: productToDelete?.product.name || '' 
        })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
} 