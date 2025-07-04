'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { warehouseAdjustmentService } from '@/services';
import { WarehouseAdjustment, WarehouseAdjustmentDetail } from '@/types/warehouse-adjustment';
import { WarehouseAdjustmentProductsTable } from '@/components/WarehouseAdjustment/WarehouseAdjustmentProductsTable';
import { AddProductForm } from '@/components/WarehouseAdjustment/AddProductForm';
import { Btn } from '@/components/atoms';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const adjustmentId = params.id as string;

  useEffect(() => {
    if (adjustmentId && can(['warehouse_adjustment_module_view'])) {
      loadAdjustmentDetails();
    }
  }, [adjustmentId, currentPage]);

  const loadAdjustmentDetails = async () => {
    try {
      setLoading(true);
      const [adjustmentData, productsData] = await Promise.all([
        warehouseAdjustmentService.getWarehouseAdjustmentById(adjustmentId),
        warehouseAdjustmentService.getWarehouseAdjustmentDetails(adjustmentId, currentPage)
      ]);
      
      setAdjustment(adjustmentData);
      setProducts(productsData.data);
      setTotalPages(productsData.meta.totalPages);
      setTotalItems(productsData.meta.total);
    } catch (error) {
      console.error('Error loading adjustment details:', error);
      toastService.error(error instanceof Error ? error.message : t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await warehouseAdjustmentService.addProductToWarehouseAdjustment(adjustmentId, productData);
      toastService.success(t('addProduct.messages.productAdded'));
      setShowAddProductForm(false);
      loadAdjustmentDetails();
    } catch (error) {
      console.error('Error adding product:', error);
      toastService.error(error instanceof Error ? error.message : t('addProduct.messages.errorAdding'));
    }
  };

  const handleUpdateProduct = async (detailId: string, productData: any) => {
    try {
      await warehouseAdjustmentService.updateWarehouseAdjustmentDetail(adjustmentId, detailId, productData);
      toastService.success(t('addProduct.messages.productUpdated'));
      loadAdjustmentDetails();
    } catch (error) {
      console.error('Error updating product:', error);
      toastService.error(error instanceof Error ? error.message : t('addProduct.messages.errorUpdating'));
    }
  };

  const handleDeleteProduct = async (detailId: string) => {
    try {
      await warehouseAdjustmentService.deleteWarehouseAdjustmentDetail(adjustmentId, detailId);
      toastService.success(t('deleteProduct.success'));
      loadAdjustmentDetails();
    } catch (error) {
      console.error('Error deleting product:', error);
      toastService.error(error instanceof Error ? error.message : t('deleteProduct.error'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!can(['warehouse_adjustment_module_view'])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{tCommon('messages.noPermission')}</h1>
          <p className="text-gray-600">{t('messages.noPermissionDesc')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('error.title')}</h1>
          <p className="text-gray-600">{t('error.adjustmentNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('details.title', { name: adjustment.code })}
              </h1>
              <p className="text-gray-600 mt-2">{t('details.subtitle')}</p>
            </div>
            <div className="flex space-x-4">
              <Btn
                onClick={() => router.push(`/${locale}/dashboard/almacenes/ajustes-de-almacen`)}
                variant="outline"
                size="lg"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                {t('actions.back')}
              </Btn>
              {!adjustment.status && (
                <Btn
                  onClick={() => setShowAddProductForm(true)}
                  variant="primary"
                  size="lg"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  {t('addProduct.title')}
                </Btn>
              )}
            </div>
          </div>
        </div>

        {/* Adjustment Info */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('details.generalInfo')}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('table.code')}</label>
                <p className="mt-1 text-sm text-gray-900">{adjustment.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('table.date')}</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(adjustment.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('table.sourceWarehouse')}</label>
                <p className="mt-1 text-sm text-gray-900">{adjustment.sourceWarehouse.name} ({adjustment.sourceWarehouse.code})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('table.targetWarehouse')}</label>
                <p className="mt-1 text-sm text-gray-900">{adjustment.targetWarehouse.name} ({adjustment.targetWarehouse.code})</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">{t('table.description')}</label>
                <p className="mt-1 text-sm text-gray-900">{adjustment.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('products.title')}</h2>
          </div>
          <WarehouseAdjustmentProductsTable
            products={products}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            adjustmentStatus={adjustment.status}
          />
        </div>

        {/* Add Product Modal */}
        {showAddProductForm && (
          <AddProductForm
            isOpen={showAddProductForm}
            onClose={() => setShowAddProductForm(false)}
            onSubmit={handleAddProduct}
            loading={false}
          />
        )}
      </div>
    </div>
  );
} 