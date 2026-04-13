"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MagnifyingGlassIcon, PencilSquareIcon, TruckIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { shipmentService, PaginatedShipmentsResponse } from '@/services/shipment.service';
import { toastService } from '@/services/toast.service';
import { Shipment, ShipmentStatus } from '@/types/shipment';
import Pagination from '@/components/Pagination/Pagination';
import { useLocaleUtils } from '@/hooks/useLocale';
import ActionsMenu from '@/components/atoms/ActionsMenu';
import ShipmentFormDrawer from '@/components/Shipment/ShipmentFormDrawer';
import ConfirmStatusModal from '@/components/Shipment/ConfirmStatusModal';
import HelpButton from '@/components/Help/HelpButton';
import { getShipmentsHelp } from '@/components/Help/configs/shipments.help';
import { usePermissions } from '@/hooks/usePermissions';

const dict = {
  es: {
    title: 'Logística y Envíos',
    totalShipments: 'Total Envíos',
    inTransit: 'En Camino',
    delivered: 'Entregados',
    avgCost: 'Costo Promedio',
    copyTrackingUrl: 'URL de rastreo',
    copyTrackingUrlCopied: '¡Copiado!',
    searchPlaceholder: 'Buscar por paquetería, nota o número de guía...',

    allStatuses: 'Todos los Estados',
    associatedSale: 'Venta Asociada',
    carrier: 'Paquetería',
    tracking: 'Rastreo',
    cost: 'Costo',
    status: 'Estado',
    date: 'Fecha',
    actions: 'Acciones',
    goToSale: 'Ir a Venta',
    noShipments: 'No se encontraron envíos',
    noMatches: 'No hay coincidencias con tu búsqueda o filtros actuales.',
    loading: 'Cargando...',
    editAction: 'Editar detalles',
    markShipped: 'Marcar como Enviado',
    markDelivered: 'Marcar como Entregado',
    successStatus: 'Estado del envío actualizado',
    errorStatus: 'Error al cargar la lista de envíos',
    errorStatusUpdate: 'Error al actualizar el estado',
    statuses: {
        [ShipmentStatus.PENDING]: 'Pendiente',
        [ShipmentStatus.PACKING]: 'Empacando',
        [ShipmentStatus.SHIPPED]: 'En camino',
        [ShipmentStatus.DELIVERED]: 'Entregado',
        [ShipmentStatus.RETURNED]: 'Devuelto',
        [ShipmentStatus.FAILED]: 'Fallido',
    }
  },
  en: {
    title: 'Logistics & Shipments',
    totalShipments: 'Total Shipments',
    inTransit: 'In Transit',
    delivered: 'Delivered',
    avgCost: 'Avg. Cost',
    copyTrackingUrl: 'Tracking URL',
    copyTrackingUrlCopied: 'Copied!',
    searchPlaceholder: 'Search by carrier, notes or tracking number...',
    allStatuses: 'All Statuses',
    associatedSale: 'Associated Sale',
    carrier: 'Carrier',
    tracking: 'Tracking',
    cost: 'Cost',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    goToSale: 'Go to Sale',
    noShipments: 'No shipments found',
    noMatches: 'No matches found for your search or filters.',
    loading: 'Loading...',
    editAction: 'Edit details',
    markShipped: 'Mark as Shipped',
    markDelivered: 'Mark as Delivered',
    successStatus: 'Shipment status updated',
    errorStatus: 'Error loading shipments list',
    errorStatusUpdate: 'Error updating status',
    statuses: {
        [ShipmentStatus.PENDING]: 'Pending',
        [ShipmentStatus.PACKING]: 'Packing',
        [ShipmentStatus.SHIPPED]: 'In transit',
        [ShipmentStatus.DELIVERED]: 'Delivered',
        [ShipmentStatus.RETURNED]: 'Returned',
        [ShipmentStatus.FAILED]: 'Failed',
    }
  },
  zh: {
    title: '物流与发货',
    totalShipments: '总发货量',
    inTransit: '运送中',
    delivered: '已送达',
    avgCost: '平均费用',
    copyTrackingUrl: '查询链接',
    copyTrackingUrlCopied: '已复制！',
    searchPlaceholder: '由此搜索承运商、备注或运单号...',
    allStatuses: '所有状态',
    associatedSale: '关联销售',
    carrier: '承运商',
    tracking: '追踪',
    cost: '成本',
    status: '状态',
    date: '日期',
    actions: '操作',
    goToSale: '前往销售',
    noShipments: '未找到发货',
    noMatches: '没有符合搜索或筛选条件的记录。',
    loading: '加载中...',
    editAction: '编辑详情',
    markShipped: '标记为已发货',
    markDelivered: '标记为已送达',
    successStatus: '发货状态已更新',
    errorStatus: '加载发货列表时出错',
    errorStatusUpdate: '更新状态时出错',
    statuses: {
        [ShipmentStatus.PENDING]: '待处理',
        [ShipmentStatus.PACKING]: '包装中',
        [ShipmentStatus.SHIPPED]: '运送中',
        [ShipmentStatus.DELIVERED]: '已送达',
        [ShipmentStatus.RETURNED]: '已退回',
        [ShipmentStatus.FAILED]: '失败',
    }
  }
};

export default function GlobalShipmentsPage() {
  const { tenant, locale } = useParams();
  const currentLocale = (locale as string) === 'en' ? 'en' : (locale as string) === 'zh' ? 'zh' : 'es';
  const t = dict[currentLocale];
  const { can } = usePermissions();

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${tenant}/rastrear`
    : `.../${tenant}/rastrear`;
  const shipmentsHelp = getShipmentsHelp(trackingUrl);

  const [copied, setCopied] = useState(false);

  const handleCopyTrackingUrl = () => {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { formatCurrency, formatDate } = useLocaleUtils();
  
  const [data, setData] = useState<PaginatedShipmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [analytics, setAnalytics] = useState<{
    total: number;
    by_status: Record<string, number>;
    avg_shipping_cost: number;
    avg_delivery_days: number;
  } | null>(null);

  // Edit/Status states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const limit = 10;

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const [response, analyticsData] = await Promise.all([
        shipmentService.getAllShipments({ page, limit, ...(search ? { search } : {}), ...(status ? { status } : {}) }),
        analytics === null ? shipmentService.getAnalytics() : Promise.resolve(null),
      ]);
      setData(response);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (error) {
      toastService.error(t.errorStatus);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, t.errorStatus, analytics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShipments();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchShipments]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsDrawerOpen(true);
  };

  const handleQuickStatus = (shipment: Shipment, status: ShipmentStatus) => {
    setSelectedShipment(shipment);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedShipment || !newStatus) return;

    try {
      setIsChangingStatus(true);
      await shipmentService.updateShipment(selectedShipment.id, { status: newStatus });
      toastService.success(t.successStatus);
      setIsStatusModalOpen(false);
      fetchShipments();
    } catch (error) {
      toastService.error(t.errorStatusUpdate);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusString = (s: ShipmentStatus) => {
    return t.statuses[s] || s;
  };

  const getStatusClasses = (s: ShipmentStatus) => {
    switch (s) {
      case ShipmentStatus.DELIVERED: return 'bg-green-100 text-green-800';
      case ShipmentStatus.SHIPPED: return 'bg-blue-100 text-blue-800';
      case ShipmentStatus.RETURNED: return 'bg-red-100 text-red-800';
      case ShipmentStatus.FAILED: return 'bg-red-100 text-red-800';
      case ShipmentStatus.PACKING: return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getActions = (shipment: Shipment) => {
    const actions = [
      {
        label: t.editAction,
        icon: <PencilSquareIcon className="h-4 w-4" />,
        onClick: () => handleOpenEdit(shipment)
      }
    ];

    if (shipment.status === ShipmentStatus.PENDING || shipment.status === ShipmentStatus.PACKING) {
      actions.push({
        label: t.markShipped,
        icon: <TruckIcon className="h-4 w-4" />,
        onClick: () => handleQuickStatus(shipment, ShipmentStatus.SHIPPED)
      });
    }

    if (shipment.status === ShipmentStatus.SHIPPED) {
      actions.push({
        label: t.markDelivered,
        icon: <CheckCircleIcon className="h-4 w-4" />,
        onClick: () => handleQuickStatus(shipment, ShipmentStatus.DELIVERED)
      });
    }

    return actions;
  };

  if (!can(['shipment_module_view'])) {
    return <div className="p-6 text-gray-500">Sin permisos para ver este módulo.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t.title}
          </h1>
          <HelpButton config={shipmentsHelp} />
        </div>
        <button
          onClick={handleCopyTrackingUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-gray-50"
          style={{ color: `rgb(var(--color-primary-600))`, borderColor: `rgb(var(--color-primary-200))` }}
        >
          {copied ? (
            <>
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-600">{t.copyTrackingUrlCopied}</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{t.copyTrackingUrl}</span>
            </>
          )}
        </button>
      </div>

      {analytics && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.totalShipments}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: `rgb(var(--color-primary-700))` }}>{analytics.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.inTransit}</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{analytics.by_status['SHIPPED'] || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.delivered}</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{analytics.by_status['DELIVERED'] || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.avgCost}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: `rgb(var(--color-primary-700))` }}>{formatCurrency(analytics.avg_shipping_cost)}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-1/4">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white"
          >
            <option value="">{t.allStatuses}</option>
            <option value={ShipmentStatus.PENDING}>{t.statuses[ShipmentStatus.PENDING]}</option>
            <option value={ShipmentStatus.PACKING}>{t.statuses[ShipmentStatus.PACKING]}</option>
            <option value={ShipmentStatus.SHIPPED}>{t.statuses[ShipmentStatus.SHIPPED]}</option>
            <option value={ShipmentStatus.DELIVERED}>{t.statuses[ShipmentStatus.DELIVERED]}</option>
            <option value={ShipmentStatus.RETURNED}>{t.statuses[ShipmentStatus.RETURNED]}</option>
            <option value={ShipmentStatus.FAILED}>{t.statuses[ShipmentStatus.FAILED]}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 mt-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : data?.data.length === 0 ? (
        <div
          className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed"
          style={{ borderColor: `rgb(var(--color-primary-200))` }}
        >
          <svg
            className="h-12 w-12 mb-4"
            style={{ color: `rgb(var(--color-primary-300))` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <p
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {t.noShipments}
          </p>
          <p
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t.noMatches}
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{
              boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.associatedSale}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.carrier}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.tracking}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.cost}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.date}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: `rgb(var(--color-primary-600))` }}>
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-primary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <Link 
                           href={`/${tenant}/${locale}/dashboard/ventas/ventas/${shipment.withdrawal_id}`}
                           className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            {t.goToSale}
                         </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {shipment.carrier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.tracking_number || 'N/A'}
                        {shipment.tracking_url && (
                          <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:text-blue-700 font-semibold inline-block">
                            [{t.tracking}]
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(shipment.shipping_cost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(shipment.status)}`}>
                          {getStatusString(shipment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(shipment.created_at, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionsMenu items={getActions(shipment)} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <ShipmentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchShipments}
        shipment={editingShipment}
      />

      <ConfirmStatusModal
        isOpen={isStatusModalOpen}
        shipment={selectedShipment}
        newStatus={newStatus}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatus}
        isLoading={isChangingStatus}
      />
    </div>
  );
}

