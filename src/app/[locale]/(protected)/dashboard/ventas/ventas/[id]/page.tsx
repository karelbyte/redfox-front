'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { toastService } from '@/services/toast.service';
import { Sale, SaleDetail } from '@/types/sale';
import { Btn } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import AddProductForm, { AddProductFormRef } from '@/components/Sale/AddProductForm';

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

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div 
            className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
            style={{ borderColor: `rgb(var(--color-primary-500))` }}
          ></div>
        </div>
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
        {!sale.status && (
          <Btn
            onClick={() => setIsAddProductDrawerOpen(true)}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('details.addProduct')}
          </Btn>
        )}
      </div>

      {/* Información de la venta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  sale.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
            <div 
              className="animate-spin h-6 w-6 border-4 border-t-transparent rounded-full"
              style={{ borderColor: `rgb(var(--color-primary-500))` }}
            ></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {sale.status ? t('details.noProductsCompletedDesc') : t('details.noProducts')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {sale.status ? '' : t('details.noProductsDesc')}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('productsTable.headers.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('productsTable.headers.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('productsTable.headers.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('productsTable.headers.subtotal')}
                    </th>
                    {!sale.status && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('productsTable.headers.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{product.product.name}</div>
                          <div className="text-gray-500">SKU: {product.product.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price.toString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {formatCurrency((product.quantity * product.price).toString())}
                      </td>
                      {!sale.status && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              title={t('actions.edit')}
                            >
                              Editar
                            </Btn>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              title={t('actions.delete')}
                            >
                              Eliminar
                            </Btn>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
} 