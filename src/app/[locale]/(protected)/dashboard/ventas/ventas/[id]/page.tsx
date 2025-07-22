'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { toastService } from '@/services/toast.service';
import { PDFService } from '@/services/pdf.service';
import { Sale, SaleDetail, SaleCloseResponse } from '@/types/sale';
import { Btn } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import AddProductForm, { AddProductFormRef } from '@/components/Sale/AddProductForm';
import SaleProductsTable from '@/components/Sale/SaleProductsTable';
import CloseSaleModal from '@/components/Sale/CloseSaleModal';
import SaleCloseResultModal from '@/components/Sale/SaleCloseResultModal';
import Loading from '@/components/Loading/Loading';

export default function SaleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('pages.sales');
  const [sale, setSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<SaleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAddProductDrawerOpen, setIsAddProductDrawerOpen] = useState(false);
  const [isEditProductDrawerOpen, setIsEditProductDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<SaleDetail | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isProductFormValid, setIsProductFormValid] = useState(false);
  const [isClosingSale, setIsClosingSale] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeResult, setCloseResult] = useState<SaleCloseResponse | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const productFormRef = useRef<AddProductFormRef>(null);

  const fetchSale = async () => {
    try {
      setLoading(true);
      const data = await saleService.getSaleById(params.id as string);
      setSale(data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('details.errorLoading'));
      }
      router.push(`/${locale}/dashboard/ventas`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!params.id) return;
    
    try {
      setLoadingProducts(true);
      const response = await saleService.getSaleDetails(params.id as string, 1);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSale();
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleGeneratePDF = async () => {
    if (!sale) return;

    try {
      setIsGeneratingPDF(true);
      
      // Generar el PDF con los productos ya cargados
      const pdfService = new PDFService();
      pdfService.generateSalePDF(sale, products, {
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

  const handleDeleteProduct = async (detailId: string) => {
    if (!sale) return;

    try {
      await saleService.deleteSaleDetail(sale.id, detailId);
      toastService.success(t('deleteProduct.success'));
      fetchSale(); // Recargar los datos de la venta
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

  const handleEditProduct = (product: SaleDetail) => {
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
    fetchSale(); // Recargar los datos de la venta
    fetchProducts(); // Recargar los productos
  };

  const handleEditProductFormSuccess = () => {
    handleEditProductDrawerClose();
    fetchSale(); // Recargar los datos de la venta
    fetchProducts(); // Recargar los productos
  };

  const handleAddProductSave = async () => {
    if (!productFormRef.current || !sale) return;

    try {
      setIsSavingProduct(true);
      const formData = await productFormRef.current.submit();
      
      if (formData) {
        await saleService.addProductToSale(sale.id, formData);
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
    if (!productFormRef.current || !sale || !productToEdit) return;

    try {
      setIsSavingProduct(true);
      const formData = await productFormRef.current.submit();
      
      if (formData) {
        await saleService.updateSaleDetail(sale.id, productToEdit.id, formData);
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

  const handleCloseReception = () => {
    setIsCloseModalOpen(true);
  };

  const handleCloseModalClose = () => {
    setIsCloseModalOpen(false);
  };

  const handleCloseModalConfirm = async () => {
    if (!sale) return;

    try {
      setIsClosingSale(true);
      const result = await saleService.closeSale(sale.id);
      setCloseResult(result);
      fetchSale();
      setIsCloseModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('closeReception.error'));
      }
    } finally {
      setIsClosingSale(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">{t('details.notFound')}</p>
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
            onClick={() => router.push(`/${locale}/dashboard/ventas`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { code: sale.code })}
            </h1>
            <p className="text-sm text-gray-500">
              {t('details.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Btn
            onClick={handleGeneratePDF}
            leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? t('actions.generatingPDF') : t('actions.generatePDF')}
          </Btn>
          
          {!sale.status && (
            <>
              <Btn
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setIsAddProductDrawerOpen(true)}
              >
                {t('details.addProduct')}
              </Btn>
              <Btn
                variant="danger"
                leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                onClick={handleCloseReception}
                loading={isClosingSale}
              >
                {t('actions.closeSale')}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Información de la venta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.generalInfo')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.code')}:</span>
              <p className="text-sm text-gray-900">{sale.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.destination')}:</span>
              <p className="text-sm text-gray-900">{sale.destination}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.status')}:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  sale.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sale.status ? t('status.completed') : t('status.pending')}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.totalAmount')}:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(sale.amount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.client')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.name')}:</span>
              <p className="text-sm text-gray-900">{sale.client.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm text-gray-900">{sale.client.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Teléfono:</span>
              <p className="text-sm text-gray-900">{sale.client.phone}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Dirección:</span>
              <p className="text-sm text-gray-900">{sale.client.address}</p>
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
      
      <div>
        {loadingProducts ? (
          <div className="flex justify-center items-center h-32">
            <Loading className="h-6 w-6" />
          </div>
        ) : (
          <SaleProductsTable
            products={products}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            isSaleOpen={!sale.status}
          />
        )}
        
        {!sale.status && products.length === 0 && !loadingProducts && (
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

      {/* Drawer para agregar producto */}
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
          saleDetail={null}
          onClose={handleAddProductDrawerClose}
          onSuccess={handleAddProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Drawer para editar producto */}
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
          saleDetail={productToEdit}
          onClose={handleEditProductDrawerClose}
          onSuccess={handleEditProductFormSuccess}
          onSavingChange={setIsSavingProduct}
          onValidChange={setIsProductFormValid}
        />
      </Drawer>

      {/* Modal de confirmación para cerrar venta */}
      <CloseSaleModal
        isOpen={isCloseModalOpen}
        sale={sale}
        onClose={handleCloseModalClose}
        onConfirm={handleCloseModalConfirm}
        isLoading={isClosingSale}
      />

      {/* Modal de resultado del cierre de venta */}
      <SaleCloseResultModal
        closeResult={closeResult}
        onClose={() => setCloseResult(null)}
      />
    </div>
  );
} 