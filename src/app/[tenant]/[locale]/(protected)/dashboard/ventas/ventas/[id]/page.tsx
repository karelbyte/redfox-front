'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon, DocumentArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { toastService } from '@/services/toast.service';
import { SalePDFService } from '@/services/sale-pdf.service';
import { Sale, SaleDetail, SaleCloseResponse, SaleStatus } from '@/types/sale';
import { Btn, Input } from '@/components/atoms';
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
  const tPdf = useTranslations('pages.sales.pdf');
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
  const [availableProducts, setAvailableProducts] = useState<InventoryProduct[]>([]);
  const [loadingAvailableProducts, setLoadingAvailableProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductsGrid, setShowProductsGrid] = useState(false);
  const productFormRef = useRef<AddProductFormRef>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced search effect para productos disponibles
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (showProductsGrid) {
        fetchAvailableProducts(searchTerm);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, showProductsGrid]);

  const fetchAvailableProducts = async (term: string = '') => {
    try {
      setLoadingAvailableProducts(true);
      const response = await inventoryService.getInventoryProducts(1, term);
      setAvailableProducts(response.data || []);
    } catch (error) {
      console.error('Error cargando productos disponibles:', error);
    } finally {
      setLoadingAvailableProducts(false);
    }
  };

  const handleQuickAddProduct = async (inventoryProduct: InventoryProduct) => {
    if (!sale) return;

    try {
      await saleService.addProductToSale(sale.id, {
        product_id: inventoryProduct.product.id,
        quantity: 1,
        price: inventoryProduct.product.base_price,
        warehouse_id: inventoryProduct.warehouse.id
      });
      toastService.success(t('addProduct.messages.productAdded'));
      fetchSale();
      fetchProducts();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('addProduct.messages.errorAdding'));
      }
    }
  };

  const handleGeneratePDF = async () => {
    if (!sale) return;

    try {
      setIsGeneratingPDF(true);
      
      // Preparar traducciones para el PDF
      const translations = {
        title: t('messages.pdfTitle'),
        code: tPdf('code'),
        date: tPdf('date'),
        client: tPdf('client'),
        destination: tPdf('destination'),
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
      const pdfService = new SalePDFService(locale);
      pdfService.generatePDF(sale, products, translations);
      
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
          {sale.status === SaleStatus.OPEN && (
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
          <div className="space-y-3 grid grid-cols-2 ">
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
                  sale.status === SaleStatus.CLOSED
                    ? 'bg-green-100 text-green-800'
                    : sale.status === SaleStatus.RETURNED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sale.status === SaleStatus.CLOSED ? t('status.completed') : sale.status === SaleStatus.RETURNED ? t('status.returned') : t('status.pending')}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.totalAmount')}:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(sale.amount)}</p>
            </div>
            {sale.pack_fiscal_status && (
              <div className="col-span-2">
                <span className="text-sm font-medium text-gray-500">{t('details.labels.fiscalStatus')}:</span>
                <span
                  className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sale.pack_fiscal_status === 'INVOICED_DIRECT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sale.pack_fiscal_status === 'INVOICED_GLOBAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t(`fiscalStatus.${sale.pack_fiscal_status}`)}
                </span>
                {sale.invoice_id && (
                  <span className="ml-2">
                    <a
                      href={`/${locale}/dashboard/facturas/${sale.invoice_id}`}
                      className="text-sm font-medium"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('details.labels.invoice')}: {sale.invoice_code ?? sale.invoice_id.slice(0, 8)}…
                    </a>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.client')}
          </h3>
          <div className="grid grid-cols-2 space-y-3">
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

      {/* Grid de productos disponibles - Solo visible si la venta está abierta */}
      {sale.status === SaleStatus.OPEN && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
                  {t('details.availableProducts')}
                </h3>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowProductsGrid(!showProductsGrid);
                    if (!showProductsGrid) {
                      fetchAvailableProducts();
                    }
                  }}
                >
                  {showProductsGrid ? t('details.hideProducts') : t('details.showProducts')}
                </Btn>
              </div>
              
              {showProductsGrid && (
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('details.searchProducts')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {showProductsGrid && (
              <div className="p-4">
                {loadingAvailableProducts ? (
                  <div className="flex justify-center items-center h-32">
                    <Loading size="md" />
                  </div>
                ) : availableProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? t('details.noProductsFound') : t('details.noProductsAvailable')}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {availableProducts.map((inventoryProduct) => (
                      <div
                        key={inventoryProduct.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleQuickAddProduct(inventoryProduct)}
                      >
                        <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          {inventoryProduct.product.images && inventoryProduct.product.images.length > 0 ? (
                            <img
                              src={process.env.NEXT_PUBLIC_URL_API + inventoryProduct.product.images[0]}
                              alt={inventoryProduct.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">Sin imagen</span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 truncate" title={inventoryProduct.product.name}>
                          {inventoryProduct.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          SKU: {inventoryProduct.product.sku}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {inventoryProduct.quantity}
                        </p>
                        <p className="text-sm font-bold mt-1" style={{ color: 'rgb(var(--color-primary-600))' }}>
                          {formatCurrency(inventoryProduct.product.base_price.toString())}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
            isSaleOpen={sale.status === SaleStatus.OPEN}
          />
        )}
        
        {sale.status === SaleStatus.OPEN && products.length === 0 && !loadingProducts && (
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