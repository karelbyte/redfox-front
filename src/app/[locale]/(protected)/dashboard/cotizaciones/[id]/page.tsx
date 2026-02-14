'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { ArrowLeftIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/outline';
import { quotationService } from '@/services/quotations.service';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { Quotation, QuotationDetail, QuotationDetailFormData, QuotationStatus } from '@/types/quotation';
import { Product } from '@/types/product';
import Drawer from '@/components/Drawer/Drawer';
import Pagination from '@/components/Pagination/Pagination';
import Loading from '@/components/Loading/Loading';
import { Btn, Input, Select } from '@/components/atoms';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface ProductDrawerData {
  product_id: string;
  quantity: string;
  price_id: string;
  custom_price: string;
  discount_percentage: string;
  discount_amount: string;
}

const QuotationDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.quotations');
  const { formatDate, formatCurrency } = useLocaleUtils();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [details, setDetails] = useState<QuotationDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer states
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [editingDetail, setEditingDetail] = useState<QuotationDetail | null>(null);
  const [productDrawerData, setProductDrawerData] = useState<ProductDrawerData>({
    product_id: '',
    quantity: '',
    price_id: '',
    custom_price: '',
    discount_percentage: '0',
    discount_amount: '0',
  });
  const [drawerErrors, setDrawerErrors] = useState<{ [key: string]: string }>({});
  const [savingProduct, setSavingProduct] = useState(false);
  const [isDrawerFormValid, setIsDrawerFormValid] = useState(false);
  
  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState<QuotationDetail | null>(null);

  useEffect(() => {
    if (quotationId) {
      loadQuotation();
      loadDetails();
      loadProducts();
    }
  }, [quotationId, currentPage]);

  const loadQuotation = async () => {
    try {
      const response = await quotationService.getQuotationById(quotationId);
      setQuotation(response);
    } catch (error) {
      console.error('Error loading quotation:', error);
      toastService.error(t('messages.errorLoadingQuotation'));
      router.push(`/${locale}/dashboard/cotizaciones/lista-de-cotizaciones`);
    }
  };

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationDetails(quotationId, currentPage);
      setDetails(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading details:', error);
      toastService.error(t('messages.errorLoadingDetails'));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    const statusConfig = {
      [QuotationStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', text: t('status.draft') },
      [QuotationStatus.SENT]: { color: 'bg-blue-100 text-blue-800', text: t('status.sent') },
      [QuotationStatus.ACCEPTED]: { color: 'bg-green-100 text-green-800', text: t('status.accepted') },
      [QuotationStatus.REJECTED]: { color: 'bg-red-100 text-red-800', text: t('status.rejected') },
      [QuotationStatus.EXPIRED]: { color: 'bg-yellow-100 text-yellow-800', text: t('status.expired') },
      [QuotationStatus.CONVERTED]: { color: 'bg-purple-100 text-purple-800', text: t('status.converted') },
    };

    const config = statusConfig[status] || statusConfig[QuotationStatus.DRAFT];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleAddProduct = () => {
    setEditingDetail(null);
    setProductDrawerData({
      product_id: '',
      quantity: '',
      price_id: '',
      custom_price: '',
      discount_percentage: '0',
      discount_amount: '0',
    });
    setDrawerErrors({});
    setShowProductDrawer(true);
  };

  const handleEditDetail = (detail: QuotationDetail) => {
    setEditingDetail(detail);
    setProductDrawerData({
      product_id: detail.product.id,
      quantity: detail.quantity.toString(),
      price_id: 'custom', // Por defecto usar custom al editar
      custom_price: detail.price.toString(),
      discount_percentage: detail.discount_percentage.toString(),
      discount_amount: detail.discount_amount.toString(),
    });
    setDrawerErrors({});
    setShowProductDrawer(true);
  };

  const handleDeleteClick = (detail: QuotationDetail) => {
    setDetailToDelete(detail);
    setDeleteModalOpen(true);
  };

  const validateProductForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!productDrawerData.product_id) {
      errors.product_id = t('form.errors.productRequired');
    }

    if (!productDrawerData.quantity || Number(productDrawerData.quantity) <= 0) {
      errors.quantity = t('form.errors.quantityRequired');
    }

    // Validar que se haya seleccionado un precio (base, lista o personalizado)
    if (!productDrawerData.price_id) {
      errors.price = t('form.errors.priceRequired');
    }

    // Si es precio personalizado, validar que tenga valor
    if (productDrawerData.price_id === 'custom') {
      if (!productDrawerData.custom_price || Number(productDrawerData.custom_price) < 0) {
        errors.custom_price = t('form.errors.priceRequired');
      }
    }

    if (Number(productDrawerData.discount_percentage) < 0 || Number(productDrawerData.discount_percentage) > 100) {
      errors.discount_percentage = t('form.errors.invalidDiscountPercentage');
    }

    if (Number(productDrawerData.discount_amount) < 0) {
      errors.discount_amount = t('form.errors.invalidDiscountAmount');
    }

    setDrawerErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsDrawerFormValid(isValid);
    return isValid;
  };

  // Validar formulario cuando cambian los datos
  useEffect(() => {
    if (showProductDrawer) {
      validateProductForm();
    }
  }, [productDrawerData, showProductDrawer]);

  const handleSaveProduct = async () => {
    if (!validateProductForm()) {
      return;
    }

    try {
      setSavingProduct(true);
      
      // Determinar el precio a usar
      let finalPrice: number;
      const selectedProduct = products.find(p => p.id === productDrawerData.product_id);
      
      if (productDrawerData.price_id === 'base') {
        // Usar precio base del producto
        finalPrice = selectedProduct?.base_price || 0;
      } else if (productDrawerData.price_id === 'custom') {
        // Usar precio personalizado
        finalPrice = Number(productDrawerData.custom_price);
      } else if (productDrawerData.price_id) {
        // Usar precio de la lista
        const selectedPrice = selectedProduct?.prices.find(p => p.id === productDrawerData.price_id);
        finalPrice = selectedPrice?.price || 0;
      } else {
        finalPrice = 0;
      }

      const data: QuotationDetailFormData = {
        product_id: productDrawerData.product_id,
        quantity: Number(productDrawerData.quantity),
        price: finalPrice,
        discount_percentage: Number(productDrawerData.discount_percentage),
        discount_amount: Number(productDrawerData.discount_amount),
      };

      if (editingDetail) {
        await quotationService.updateQuotationDetail(quotationId, editingDetail.id, data);
        toastService.success(t('messages.productUpdated'));
      } else {
        await quotationService.addProductToQuotation(quotationId, data);
        toastService.success(t('messages.productAdded'));
      }

      setShowProductDrawer(false);
      loadDetails();
      loadQuotation(); // Reload to get updated totals
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorSavingProduct'));
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!detailToDelete) return;

    try {
      await quotationService.deleteQuotationDetail(quotationId, detailToDelete.id);
      toastService.success(t('messages.productDeleted'));
      setDeleteModalOpen(false);
      setDetailToDelete(null);
      loadDetails();
      loadQuotation(); // Reload to get updated totals
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeletingProduct'));
      }
    }
  };

  const handleConvertToSale = async () => {
    if (!quotation) return;

    if (!confirm(t('messages.confirmConvertToSale', { code: quotation.code }))) {
      return;
    }

    try {
      const result = await quotationService.convertToSale(quotationId);
      toastService.success(result.message);
      loadQuotation(); // Reload to get updated status
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorConverting'));
      }
    }
  };

  const canModify = quotation?.status !== QuotationStatus.CONVERTED;
  const canConvertToSale = quotation &&
    quotation.status !== QuotationStatus.CONVERTED &&
    quotation.status !== QuotationStatus.REJECTED &&
    quotation.status !== QuotationStatus.EXPIRED &&
    details.length > 0;

  if (loading && !quotation) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('messages.errorLoadingQuotation')}
          </h2>
          <Btn
            onClick={() => router.push(`/${locale}/dashboard/cotizaciones/lista-de-cotizaciones`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('common.actions.back')}
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
            onClick={() => router.push(`/${locale}/dashboard/cotizaciones/lista-de-cotizaciones`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { code: quotation.code })}
            </h1>
            <p className="text-sm text-gray-600">{t('details.subtitle')}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {canConvertToSale && (
            <Btn
              variant="primary"
              onClick={handleConvertToSale}
              leftIcon={<BoltIcon className="h-5 w-5" />}
              className="!bg-green-600 hover:!bg-green-700"
            >
              {t('actions.convertToSale')}
            </Btn>
          )}
          {canModify && details.length > 0 && (
            <Btn
              onClick={handleAddProduct}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t('actions.addProduct')}
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
              <p className="text-sm text-gray-900">{formatDate(quotation.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.validUntil')}:</span>
              <p className="text-sm text-gray-900">{quotation.valid_until ? formatDate(quotation.valid_until) : '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.status')}:</span>
              <div className="mt-1">
                {getStatusBadge(quotation.status)}
              </div>
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
              <p className="text-sm text-gray-900">{quotation.client.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.code')}:</span>
              <p className="text-sm text-gray-900">{quotation.client.code}</p>
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
              <p className="text-sm text-gray-900">{quotation.warehouse.name}</p>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-1">
                <span>{t('details.labels.total')}:</span>
                <span className="text-lg font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
                  {formatCurrency(quotation.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="py-4 border-gray-200">
        <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
          {t('details.products')}
        </h3>
      </div>

      {/* Products Table */}
      <div
        className="bg-white rounded-lg overflow-hidden mb-6"
        style={{
          boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
        }}
      >

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : details.length === 0 ? (
          <div className="text-center py-12">
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('details.noProducts')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canModify
                ? t('details.noProductsDesc')
                : t('details.noProductsClosedDesc')
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                    {t('details.table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                    {t('details.table.quantity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                    {t('details.table.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                    {t('details.table.discount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                    {t('details.table.subtotal')}
                  </th>
                  {canModify && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ color: 'rgb(var(--color-primary-600))' }}>
                      {t('details.table.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {details.map((detail) => (
                  <tr key={detail.id} className="hover:bg-primary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{detail.product.name}</div>
                        <div className="text-sm text-gray-500">{detail.product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.quantity} {detail.product.measurement_unit?.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(detail.price))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(detail.discount_percentage) > 0 && (
                        <span className="text-red-600">-{detail.discount_percentage}%</span>
                      )}
                      {Number(detail.discount_amount) > 0 && (
                        <span className="text-red-600">-{formatCurrency(Number(detail.discount_amount))}</span>
                      )}
                      {Number(detail.discount_percentage) === 0 && Number(detail.discount_amount) === 0 && '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(Number(detail.subtotal))}
                    </td>
                    {canModify && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDetail(detail)}
                            leftIcon={<PencilIcon className="h-4 w-4" />}
                            title={t('actions.edit')}
                          />
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(detail)}
                            leftIcon={<TrashIcon className="h-4 w-4" />}
                            title={t('actions.delete')}
                            style={{ color: '#dc2626' }}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botón de agregar producto - solo visible cuando se puede modificar y NO hay productos */}
      {canModify && !loading && details.length === 0 && (
        <div className="mt-6 text-center">
          <Btn
            leftIcon={<PlusIcon className="h-5 w-5" />}
            onClick={handleAddProduct}
          >
            {t('actions.addProduct')}
          </Btn>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Product Drawer */}
      <Drawer
        id="product-drawer"
        isOpen={showProductDrawer}
        onClose={() => setShowProductDrawer(false)}
        title={editingDetail ? t('actions.editProduct') : t('actions.addProduct')}
        onSave={handleSaveProduct}
        isSaving={savingProduct}
        isFormValid={isDrawerFormValid}
      >
        <div className="space-y-4">
          <Select
            id="product"
            label={t('form.product')}
            value={productDrawerData.product_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selectedProduct = products.find(p => p.id === e.target.value);
              setProductDrawerData(prev => ({
                ...prev,
                product_id: e.target.value,
                price_id: 'base', // Seleccionar precio base por defecto
                custom_price: ''
              }));
            }}
            options={products.map((product) => ({
              value: product.id,
              label: `${product.sku} - ${product.name}`
            }))}
            placeholder={t('form.placeholders.selectProduct')}
            required
            error={drawerErrors.product_id}
          />

          {productDrawerData.product_id && (() => {
            const selectedProduct = products.find(p => p.id === productDrawerData.product_id);
            return selectedProduct ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('form.priceList')}
                </label>
                <div className="space-y-2">
                  {/* Precio Base - Siempre se muestra primero */}
                  <label
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: productDrawerData.price_id === 'base' ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                      backgroundColor: productDrawerData.price_id === 'base' ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="price"
                      value="base"
                      checked={productDrawerData.price_id === 'base'}
                      onChange={(e) => {
                        setProductDrawerData(prev => ({
                          ...prev,
                          price_id: e.target.value,
                          custom_price: ''
                        }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{t('form.basePrice')}</span>
                        <span className="text-sm font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                          {formatCurrency(selectedProduct.base_price)}
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Lista de precios adicionales */}
                  {selectedProduct.prices && selectedProduct.prices.length > 0 && selectedProduct.prices.map((price) => (
                    <label
                      key={price.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: productDrawerData.price_id === price.id ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                        backgroundColor: productDrawerData.price_id === price.id ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                      }}
                    >
                      <input
                        type="radio"
                        name="price"
                        value={price.id}
                        checked={productDrawerData.price_id === price.id}
                        onChange={(e) => {
                          setProductDrawerData(prev => ({
                            ...prev,
                            price_id: e.target.value,
                            custom_price: ''
                          }));
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{price.name}</span>
                          <span className="text-sm font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                            {formatCurrency(price.price)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  {/* Opción de precio personalizado */}
                  <label
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: productDrawerData.price_id === 'custom' ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                      backgroundColor: productDrawerData.price_id === 'custom' ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="price"
                      value="custom"
                      checked={productDrawerData.price_id === 'custom'}
                      onChange={() => {
                        setProductDrawerData(prev => ({
                          ...prev,
                          price_id: 'custom',
                          custom_price: selectedProduct.base_price.toString()
                        }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-900">{t('form.customPrice')}</span>
                    </div>
                  </label>
                </div>
                {drawerErrors.price && (
                  <p className="text-sm text-red-600">{drawerErrors.price}</p>
                )}
              </div>
            ) : null;
          })()}

          {/* Campo de precio personalizado */}
          {productDrawerData.product_id && productDrawerData.price_id === 'custom' && (
            <Input
              type="number"
              id="custom_price"
              label={t('form.price')}
              value={productDrawerData.custom_price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductDrawerData(prev => ({ ...prev, custom_price: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              error={drawerErrors.custom_price}
            />
          )}

          <Input
            type="number"
            id="quantity"
            label={t('form.quantity')}
            value={productDrawerData.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductDrawerData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="1"
            min="0.01"
            step="0.01"
            required
            error={drawerErrors.quantity}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              id="discount_percentage"
              label={t('form.discountPercentage')}
              value={productDrawerData.discount_percentage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductDrawerData(prev => ({ ...prev, discount_percentage: e.target.value }))}
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
              error={drawerErrors.discount_percentage}
            />

            <Input
              type="number"
              id="discount_amount"
              label={t('form.discountAmount')}
              value={productDrawerData.discount_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductDrawerData(prev => ({ ...prev, discount_amount: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              error={drawerErrors.discount_amount}
            />
          </div>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDetailToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('messages.confirmDeleteProductTitle')}
        message={t('messages.confirmDeleteProduct', { name: detailToDelete?.product.name || '' })}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        confirmButtonStyle={{ backgroundColor: '#dc2626' }}
      />
    </div>
  );
};

export default QuotationDetailsPage;