/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProductHistoryItem } from "@/types/product-history";
import { ApiResponse } from "@/types/api";
import { productHistoryService } from "@/services/product-history.service";
import { toastService } from "@/services/toast.service";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Pagination from "@/components/Pagination/Pagination";
import { Btn } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import EmptyState from "@/components/atoms/EmptyState";

export default function ProductHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('pages.inventory');
  const tCommon = useTranslations('common');
  const productId = params.productId as string;
  const warehouseId = params.warehouseId as string;

  const [historyItems, setHistoryItems] = useState<ProductHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [productInfo, setProductInfo] = useState<{ sku: string; description: string } | null>(null);
  const [warehouseInfo, setWarehouseInfo] = useState<{ code: string; name: string } | null>(null);

  const fetchHistory = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response: ApiResponse<ProductHistoryItem[]> = await productHistoryService.getProductHistory(
        productId,
        warehouseId,
        page
      );
      setHistoryItems(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
      setCurrentPage(page);

      // Obtener información del producto y almacén del primer item si existe
      if (response.data.length > 0) {
        const firstItem = response.data[0];
        setProductInfo({
          sku: firstItem.product.sku,
          description: firstItem.product.description,
        });
        setWarehouseInfo({
          code: firstItem.warehouse.code,
          name: firstItem.warehouse.name,
        });
      }
    } catch {
      toastService.error(t('messages.errorLoadingHistory'));
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, [productId, warehouseId, t]);

  useEffect(() => {
    if (productId && warehouseId) {
      fetchHistory(1);
    }
  }, [fetchHistory, productId, warehouseId]);

  useEffect(() => {
    if (productId && warehouseId) {
      fetchHistory(currentPage);
    }
  }, [currentPage, fetchHistory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const operationTypeDictionary = {
    WAREHOUSE_OPENING: t('operationTypes.WAREHOUSE_OPENING'),
    RECEPTION: t('operationTypes.RECEPTION'),
    PURCHASE: t('operationTypes.PURCHASE'),
    TRANSFER_IN: t('operationTypes.TRANSFER_IN'),
    ADJUSTMENT_IN: t('operationTypes.ADJUSTMENT_IN'),
    RETURN_IN: t('operationTypes.RETURN_IN'),
    SALE: t('operationTypes.SALE'),
    WITHDRAWAL: t('operationTypes.WITHDRAWAL'),
    TRANSFER_OUT: t('operationTypes.TRANSFER_OUT'),
    ADJUSTMENT_OUT: t('operationTypes.ADJUSTMENT_OUT'),
    DETERIORATION: t('operationTypes.DETERIORATION'),
    RETURN_OUT: t('operationTypes.RETURN_OUT'),
    DAMAGE: t('operationTypes.DAMAGE'),
  };

  const getOperationTypeText = (type: string) => {
    return operationTypeDictionary[type as keyof typeof operationTypeDictionary] || type;
  };

  const isInOperation = (type: string) => {
    const inOperations = ['WAREHOUSE_OPENING', 'RECEPTION', 'PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN_IN'];
    return inOperations.includes(type);
  };

  const getOperationTypeClass = (type: string) => {
    // Operaciones de entrada (verde)
    const inOperations = ['WAREHOUSE_OPENING', 'RECEPTION', 'PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN_IN'];
    // Operaciones de salida (rojo)
    const outOperations = ['SALE', 'WITHDRAWAL', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'DETERIORATION', 'RETURN_OUT', 'DAMAGE'];
    
    if (inOperations.includes(type)) {
      return "bg-green-100 text-green-800";
    } else if (outOperations.includes(type)) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            title={tCommon('actions.back')}
          />
          <div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: `rgb(var(--color-primary-700))` }}
            >
              {t('history.title')}
            </h1>
            {productInfo && warehouseInfo && (
              <p 
                className="text-sm mt-1"
                style={{ color: `rgb(var(--color-text-secondary))` }}
              >
                {productInfo.sku} - {productInfo.description} en {warehouseInfo.code} - {warehouseInfo.name}
              </p>
            )}
          </div>
        </div>
        {total > 0 && (
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-text-secondary))` }}
          >
            {t('history.movementsRegistered', { count: total })}
          </p>
        )}
      </div>

      {historyItems.length === 0 ? (
        <EmptyState
          title={t('history.noHistory')}
          description={t('history.noHistoryDesc')}
        />
      ) : (
        <>
          <div 
            className="bg-white rounded-lg overflow-hidden mb-6"
            style={{ 
              boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)` 
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  >
                    {t('history.table.date')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  >
                    {t('history.table.operationType')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  >
                    {t('history.table.quantity')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  >
                    {t('history.table.currentStock')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: `rgb(var(--color-primary-600))` }}
                  >
                    {t('history.table.operationId')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-primary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOperationTypeClass(
                          item.operation_type
                        )}`}
                      >
                        {getOperationTypeText(item.operation_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {isInOperation(item.operation_type) ? "+" : "-"}{item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.current_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.operation_id.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div 
              className="rounded-lg shadow p-4"
              style={{ backgroundColor: `rgb(var(--color-surface))` }}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 