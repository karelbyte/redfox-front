'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { receptionService } from '@/services/receptions.service';
import { toastService } from '@/services/toast.service';
import { Reception, ReceptionDetail, ReceptionCloseResponse } from '@/types/reception';
import { Btn } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import AddProductForm, { AddProductFormRef } from '@/components/Reception/AddProductForm';
import ReceptionProductsTable from '@/components/Reception/ReceptionProductsTable';
import CloseReceptionModal from '@/components/Reception/CloseReceptionModal';
import ReceptionCloseResultModal from '@/components/Reception/ReceptionCloseResultModal';
import Loading from '@/components/Loading/Loading';

export default function ReceptionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('pages.receptions');
  const [reception, setReception] = useState<Reception | null>(null);
  const [products, setProducts] = useState<ReceptionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAddProductDrawerOpen, setIsAddProductDrawerOpen] = useState(false);
  const [isEditProductDrawerOpen, setIsEditProductDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ReceptionDetail | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isProductFormValid, setIsProductFormValid] = useState(false);
  const [isClosingReception, setIsClosingReception] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeResult, setCloseResult] = useState<ReceptionCloseResponse | null>(null);
  const productFormRef = useRef<AddProductFormRef>(null);

  const fetchReception = async () => {
    try {
      setLoading(true);
      const data = await receptionService.getReceptionById(params.id as string);
      setReception(data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('details.errorLoading'));
      }
      router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await receptionService.getReceptionDetails(params.id as string);
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
  };

  useEffect(() => {
    fetchReception();
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDeleteProduct = async (detailId: string) => {
    try {
      await receptionService.deleteReceptionDetail(params.id as string, detailId);
      fetchProducts();
      toastService.success(t('deleteProduct.success'));
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('deleteProduct.error'));
      }
    }
  };

  const handleEditProduct = (product: ReceptionDetail) => {
    setProductToEdit(product);
    setIsEditProductDrawerOpen(true);
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
    fetchProducts();
  };

  const handleEditProductFormSuccess = () => {
    handleEditProductDrawerClose();
    fetchProducts();
  };

  const handleAddProductSave = () => {
    if (productFormRef.current) {
      productFormRef.current.submit();
    }
  };

  const handleEditProductSave = () => {
    if (productFormRef.current) {
      productFormRef.current.submit();
    }
  };

  const handleCloseReception = () => {
    setIsCloseModalOpen(true);
  };

  const handleCloseModalClose = () => {
    setIsCloseModalOpen(false);
  };

  const handleCloseModalConfirm = async () => {
    if (!reception) return;

    try {
      setIsClosingReception(true);
      const result = await receptionService.closeReception(reception.id);
      setCloseResult(result);
      fetchReception();
      setIsCloseModalOpen(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!reception) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('details.notFound')}
          </h2>
          <Btn
            onClick={() => router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
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
            onClick={() => router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { code: reception.code })}
            </h1>
            <p className="text-sm text-gray-600">{t('details.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {reception.status && (
            <Btn
              variant="danger"
              onClick={handleCloseReception}
              leftIcon={<CheckCircleIcon className="h-5 w-5" />}
            >
              {t('actions.closeReception')}
            </Btn>
          )}
        </div>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.generalInfo')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.date')}:</span>
              <p className="text-sm text-gray-900">{new Date(reception.date).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.code')}:</span>
              <p className="text-sm text-gray-900">{reception.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.status')}:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  reception.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {reception.status ? t('status.open') : t('status.closed')}
              </span>
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
              <p className="text-sm text-gray-900">{reception.provider.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.document')}:</span>
              <p className="text-sm text-gray-900">{reception.document}</p>
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
              <p className="text-sm text-gray-900">{reception.warehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.totalAmount')}:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(reception.amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="py-4 border-gray-200">
        <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
          {t('productsTable.title')}
        </h3>
      </div>
      
      <div className="mb-6">
        {loadingProducts ? (
          <div className="flex justify-center items-center h-32">
            <Loading className="h-6 w-6" />
          </div>
        ) : (
          <ReceptionProductsTable
            products={products}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            isReceptionOpen={reception.status}
          />
        )}
        
        {/* Botón de agregar producto - solo visible cuando la recepción está abierta */}
        {reception.status && !loadingProducts && (
          <div className="mt-6 text-center">
            <Btn
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setIsAddProductDrawerOpen(true)}
            >
              {t('details.addProduct')}
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
        title={t('editProduct.title')}
        onSave={handleEditProductSave}
        isSaving={isSavingProduct}
        isFormValid={isProductFormValid}
      >
        <AddProductForm
          ref={productFormRef}
          receptionDetail={productToEdit}
          onClose={handleEditProductDrawerClose}
          onSuccess={handleEditProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Modal para cerrar recepción */}
      <CloseReceptionModal
        isOpen={isCloseModalOpen}
        reception={reception}
        onClose={handleCloseModalClose}
        onConfirm={handleCloseModalConfirm}
        isLoading={isClosingReception}
      />

      {/* Modal para mostrar resultado del cierre */}
      {closeResult && (
        <ReceptionCloseResultModal
          closeResult={closeResult}
          onClose={() => setCloseResult(null)}
        />
      )}
    </div>
  );
} 