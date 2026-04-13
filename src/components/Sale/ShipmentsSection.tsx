import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon, PencilSquareIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { shipmentService } from '@/services/shipment.service';
import { toastService } from '@/services/toast.service';
import { Shipment, ShipmentStatus } from '@/types/shipment';
import { Btn } from '@/components/atoms';
import ActionsMenu from '@/components/atoms/ActionsMenu';
import { useLocaleUtils } from '@/hooks/useLocale';
import ShipmentFormDrawer from '@/components/Shipment/ShipmentFormDrawer';
import ConfirmStatusModal from '@/components/Shipment/ConfirmStatusModal';

interface ShipmentsSectionProps {
  saleId: string;
}

const dict = {
  es: {
    title: 'Envíos y Logística',
    add: 'Añadir Envío',
    loading: 'Cargando...',
    noShipments: 'No hay envíos registrados',
    noShipmentsDesc: 'Comienza añadiendo el primer envío para esta venta.',
    carrier: 'Paquetería',
    tracking: 'Rastreo',
    status: 'Estado',
    cost: 'Costo',
    actions: 'Acciones',
    editAction: 'Editar detalles',
    markShipped: 'Marcar como Enviado',
    markDelivered: 'Marcar como Entregado',
    successStatus: 'Estado del envío actualizado',
    errorStatus: 'Error al actualizar el estado',
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
    title: 'Shipments & Logistics',
    add: 'Add Shipment',
    loading: 'Loading...',
    noShipments: 'No shipments registered',
    noShipmentsDesc: 'Start by adding the first shipment for this sale.',
    carrier: 'Carrier',
    tracking: 'Tracking',
    status: 'Status',
    cost: 'Cost',
    actions: 'Actions',
    editAction: 'Edit details',
    markShipped: 'Mark as Shipped',
    markDelivered: 'Mark as Delivered',
    successStatus: 'Shipment status updated',
    errorStatus: 'Error updating status',
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
    title: '发货与物流',
    add: '添加发货',
    loading: '加载中...',
    noShipments: '暂无发货记录',
    noShipmentsDesc: '为此销售订单添加第一个发货信息。',
    carrier: '承运商',
    tracking: '追踪',
    status: '状态',
    cost: '费用',
    actions: '操作',
    editAction: '编辑详情',
    markShipped: '标记为已发货',
    markDelivered: '标记为已送达',
    successStatus: '发货状态已更新',
    errorStatus: '更新状态时出错',
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

export default function ShipmentsSection({ saleId }: ShipmentsSectionProps) {
  const { locale } = useParams();
  const currentLocale = (locale as string) === 'en' ? 'en' : (locale as string) === 'zh' ? 'zh' : 'es';
  const t = dict[currentLocale];

  const { formatCurrency, formatDate } = useLocaleUtils();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Status Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getShipmentsBySale(saleId);
      setShipments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (saleId) {
      fetchShipments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  const handleOpenCreate = () => {
    setEditingShipment(null);
    setIsDrawerOpen(true);
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
      toastService.error(t.errorStatus);
    } finally {
      setIsChangingStatus(false);
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

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
          {t.title}
        </h3>
        <Btn leftIcon={<PlusIcon className="h-5 w-5" />} onClick={handleOpenCreate}>
          {t.add}
        </Btn>
      </div>

      {loading ? (
        <div className="text-center py-4">{t.loading}</div>
      ) : shipments.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">{t.noShipments}</p>
          <p className="text-gray-400 text-sm">{t.noShipmentsDesc}</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.carrier}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.tracking}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.cost}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.carrier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.tracking_number || '-'}
                    {shipment.tracking_url && (
                      <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 text-xs">
                        [Link]
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      shipment.status === ShipmentStatus.DELIVERED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t.statuses[shipment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(shipment.shipping_cost || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionsMenu items={getActions(shipment)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ShipmentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchShipments}
        saleId={saleId}
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
