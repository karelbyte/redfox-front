'use client'

import { useParams } from 'next/navigation';
import { Shipment, ShipmentStatus } from '@/types/shipment';
import { Btn } from '@/components/atoms';

interface ConfirmStatusModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  newStatus: ShipmentStatus | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const dict = {
  es: {
    title: 'Cambiar Estado a ',
    message: '¿Estás seguro que deseas cambiar el estatus del envío de {carrier} a "{status}"?',
    confirm: 'Sí, confirmar',
    cancel: 'Cancelar',
    saving: 'Guardando...',
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
    title: 'Change Status to ',
    message: 'Are you sure you want to change the shipping status of {carrier} to "{status}"?',
    confirm: 'Yes, confirm',
    cancel: 'Cancel',
    saving: 'Saving...',
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
    title: '将状态更改为 ',
    message: '您确定要将 {carrier} 的发货状态更改为 "{status}" 吗？',
    confirm: '是的，确认',
    cancel: '取消',
    saving: '正在保存...',
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

export default function ConfirmStatusModal({ 
  isOpen,
  shipment, 
  newStatus,
  onClose, 
  onConfirm, 
  isLoading = false 
}: ConfirmStatusModalProps) {
  const { locale } = useParams();
  const currentLocale = (locale as string) === 'en' ? 'en' : (locale as string) === 'zh' ? 'zh' : 'es';
  const t = dict[currentLocale];
  
  if (!isOpen || !shipment || !newStatus) return null;

  const statusLabel = t.statuses[newStatus];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div 
              className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
            >
              <svg
                className="h-6 w-6"
                style={{ color: `rgb(var(--color-primary-600))` }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t.title}{statusLabel}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t.message.replace('{carrier}', shipment.carrier).replace('{status}', statusLabel)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Btn
              variant="primary"
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
            >
              {isLoading ? t.saving : t.confirm}
            </Btn>
            <Btn
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 inline-flex w-full justify-center text-sm sm:mt-0 sm:w-auto"
            >
              {t.cancel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
