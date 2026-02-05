'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { quotationService } from '@/services/quotations.service';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { Quotation, QuotationDetail, QuotationDetailFormData, QuotationStatus } from '@/types/quotation';
import { Product } from '@/types/product';
import { Input, Select } from '@/components/atoms';
import Modal from '@/components/Modal/Modal';
import Pagination from '@/components/Pagination/Pagination';

interface ProductModalData {
  product_id: string;
  quantity: string;
  price: string;
  discount_percentage: string;
  discount_amount: string;
}

const QuotationDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('pages.quotations');
  const { formatDate, formatCurrency } = useLocaleUtils();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [details, setDetails] = useState<QuotationDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<QuotationDetail | null>(null);
  const [productModalData, setProductModalData] = useState<ProductModalData>({
    product_id: '',
    quantity: '',
    price: '',
    discount_percentage: '0',
    discount_amount: '0',
  });
  const [modalErrors, setModalErrors] = useState<{ [key: string]: string }>({});
  const [savingProduct, setSavingProduct] = useState(false);

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
      router.push('/dashboard/cotizaciones');
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
    setProductModalData({
      product_id: '',
      quantity: '',
      price: '',
      discount_percentage: '0',
      discount_amount: '0',
    });
    setModalErrors({});
    setShowProductModal(true);
  };

  const handleEditDetail = (detail: QuotationDetail) => {
    setEditingDetail(detail);
    setProductModalData({
      product_id: detail.product.id,
      quantity: detail.quantity.toString(),
      price: detail.price.toString(),
      discount_percentage: detail.discount_percentage.toString(),
      discount_amount: detail.discount_amount.toString(),
    });
    setModalErrors({});
    setShowProductModal(true);
  };

  const validateProductForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!productModalData.product_id) {
      errors.product_id = t('form.errors.productRequired');
    }

    if (!productModalData.quantity || Number(productModalData.quantity) <= 0) {
      errors.quantity = t('form.errors.quantityRequired');
    }

    if (!productModalData.price || Number(productModalData.price) < 0) {
      errors.price = t('form.errors.priceRequired');
    }

    if (Number(productModalData.discount_percentage) < 0 || Number(productModalData.discount_percentage) > 100) {
      errors.discount_percentage = t('form.errors.invalidDiscountPercentage');
    }

    if (Number(productModalData.discount_amount) < 0) {
      errors.discount_amount = t('form.errors.invalidDiscountAmount');
    }

    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm()) {
      return;
    }

    try {
      setSavingProduct(true);
      const data: QuotationDetailFormData = {
        product_id: productModalData.product_id,
        quantity: Number(productModalData.quantity),
        price: Number(productModalData.price),
        discount_percentage: Number(productModalData.discount_percentage),
        discount_amount: Number(productModalData.discount_amount),
      };

      if (editingDetail) {
        await quotationService.updateQuotationDetail(quotationId, editingDetail.id, data);
        toastService.success(t('messages.productUpdated'));
      } else {
        await quotationService.addProductToQuotation(quotationId, data);
        toastService.success(t('messages.productAdded'));
      }

      setShowProductModal(false);
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

  const handleDeleteDetail = async (detail: QuotationDetail) => {
    if (!confirm(t('messages.confirmDeleteProduct', { name: detail.product.name }))) {
      return;
    }

    try {
      await quotationService.deleteQuotationDetail(quotationId, detail.id);
      toastService.success(t('messages.productDeleted'));
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

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/dashboard/cotizaciones')}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {t('details.title', { code: quotation.code })}
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-700">{t('details.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          {canConvertToSale && (
            <button
              onClick={handleConvertToSale}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {t('actions.convertToSale')}
            </button>
          )}
          {canModify && (
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ 
                backgroundColor: 'rgb(var(--color-primary-600))'
              } as React.CSSProperties}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('actions.addProduct')}
            </button>
          )}
        </div>
      </div>

      {/* Quotation Info */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.client')}</label>
            <p className="mt-1 text-sm text-gray-900">{quotation.client.name}</p>
            <p className="text-xs text-gray-500">{quotation.client.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.warehouse')}</label>
            <p className="mt-1 text-sm text-gray-900">{quotation.warehouse.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.date')}</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(quotation.date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.validUntil')}</label>
            <p className="mt-1 text-sm text-gray-900">
              {quotation.valid_until ? formatDate(quotation.valid_until) : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.status')}</label>
            <div className="mt-1">
              {getStatusBadge(quotation.status)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.subtotal')}</label>
            <p className="mt-1 text-sm text-gray-900">{formatCurrency(quotation.subtotal)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.tax')}</label>
            <p className="mt-1 text-sm text-gray-900">{formatCurrency(quotation.tax)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('details.total')}</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(quotation.total)}</p>
          </div>
        </div>
        {quotation.notes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">{t('details.notes')}</label>
            <p className="mt-1 text-sm text-gray-900">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('details.products')}</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : details.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('details.noProducts')}
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
                  <tr key={detail.id} className="hover:bg-gray-50">
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
                          <button
                            onClick={() => handleEditDetail(detail)}
                            className="hover:opacity-75 transition-opacity"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                            title={t('actions.edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDetail(detail)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title={t('actions.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingDetail ? t('actions.editProduct') : t('actions.addProduct')}
        onSave={handleSaveProduct}
        isSaving={savingProduct}
      >
        <div className="space-y-4">
          <Select
            id="product"
            label={t('form.product')}
            value={productModalData.product_id}
            onChange={(e) => {
              setProductModalData(prev => ({
                ...prev,
                product_id: e.target.value
              }));
            }}
            options={products.map((product) => ({
              value: product.id,
              label: `${product.sku} - ${product.name}`
            }))}
            placeholder={t('form.placeholders.selectProduct')}
            required
            error={modalErrors.product_id}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              id="quantity"
              label={t('form.quantity')}
              value={productModalData.quantity}
              onChange={(e) => setProductModalData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="1"
              min="0.01"
              step="0.01"
              required
              error={modalErrors.quantity}
            />

            <Input
              type="number"
              id="price"
              label={t('form.price')}
              value={productModalData.price}
              onChange={(e) => setProductModalData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              error={modalErrors.price}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              id="discount_percentage"
              label={t('form.discountPercentage')}
              value={productModalData.discount_percentage}
              onChange={(e) => setProductModalData(prev => ({ ...prev, discount_percentage: e.target.value }))}
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
              error={modalErrors.discount_percentage}
            />

            <Input
              type="number"
              id="discount_amount"
              label={t('form.discountAmount')}
              value={productModalData.discount_amount}
              onChange={(e) => setProductModalData(prev => ({ ...prev, discount_amount: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              error={modalErrors.discount_amount}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuotationDetailsPage;