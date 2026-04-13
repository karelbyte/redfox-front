'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { shipmentService } from '@/services/shipment.service';
import { toastService } from '@/services/toast.service';
import { Shipment, ShipmentStatus, CreateShipmentDto, UpdateShipmentDto } from '@/types/shipment';
import { Input, Select } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';

interface ShipmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saleId?: string; // Required for create
  shipment?: Shipment | null; // Provided for edit
}

const dict = {
  es: {
    editTitle: 'Editar Envío',
    addTitle: 'Añadir Envío',
    carrier: 'Paquetería',
    carrierPlaceholder: 'Ej: FedEx, DHL, Estafeta...',
    status: 'Estado',
    tracking: 'Número de Rastreo',
    trackingPlaceholder: 'Número de guía...',
    url: 'URL de Rastreo',
    cost: 'Costo de Envío',
    notes: 'Notas',
    carrierRequired: 'La paquetería es obligatoria',
    successUpdate: 'Envío actualizado correctamente',
    successCreate: 'Envío registrado correctamente',
    errorUpdate: 'Error al actualizar el envío',
    errorCreate: 'Error al registrar el envío',
    save: 'Guardar',
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
    editTitle: 'Edit Shipment',
    addTitle: 'Add Shipment',
    carrier: 'Carrier',
    carrierPlaceholder: 'Ex: FedEx, DHL, UPS...',
    status: 'Status',
    tracking: 'Tracking Number',
    trackingPlaceholder: 'Tracking ID...',
    url: 'Tracking URL',
    cost: 'Shipping Cost',
    notes: 'Notes',
    carrierRequired: 'Carrier is required',
    successUpdate: 'Shipment updated successfully',
    successCreate: 'Shipment registered successfully',
    errorUpdate: 'Error updating shipment',
    errorCreate: 'Error registering shipment',
    save: 'Save',
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
    editTitle: '编辑发货',
    addTitle: '添加发货',
    carrier: '承运商',
    carrierPlaceholder: '例如：顺丰, DHL, 联邦快递...',
    status: '状态',
    tracking: '运单号',
    trackingPlaceholder: '输入运单号...',
    url: '查询网址',
    cost: '运费',
    notes: '备注',
    carrierRequired: '承运商为必填项',
    successUpdate: '发货信息更新成功',
    successCreate: '发货信息登记成功',
    errorUpdate: '更新发货时出错',
    errorCreate: '登记发货时出错',
    save: '保存',
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

export default function ShipmentFormDrawer({ 
  isOpen, 
  onClose, 
  onSuccess, 
  saleId, 
  shipment 
}: ShipmentFormDrawerProps) {
  const { locale } = useParams();
  const currentLocale = (locale as string) === 'en' ? 'en' : (locale as string) === 'zh' ? 'zh' : 'es';
  const t = dict[currentLocale];

  const isEditing = !!shipment;
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CreateShipmentDto | UpdateShipmentDto>({
    carrier: '',
    tracking_number: '',
    tracking_url: '',
    shipping_cost: 0,
    notes: '',
    status: ShipmentStatus.PENDING
  });

  useEffect(() => {
    if (shipment) {
      setFormData({
        carrier: shipment.carrier || '',
        tracking_number: shipment.tracking_number || '',
        tracking_url: shipment.tracking_url || '',
        shipping_cost: Number(shipment.shipping_cost) || 0,
        notes: shipment.notes || '',
        status: shipment.status
      });
    } else {
      setFormData({
        carrier: '',
        tracking_number: '',
        tracking_url: '',
        shipping_cost: 0,
        notes: '',
        status: ShipmentStatus.PENDING
      });
    }
  }, [shipment, isOpen]);

  const handleSave = async () => {
    if (!formData.carrier?.trim()) {
      toastService.error(t.carrierRequired);
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing && shipment) {
        await shipmentService.updateShipment(shipment.id, formData as UpdateShipmentDto);
        toastService.success(t.successUpdate);
      } else if (saleId) {
        await shipmentService.createShipment(saleId, formData as CreateShipmentDto);
        toastService.success(t.successCreate);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastService.error(isEditing ? t.errorUpdate : t.errorCreate);
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = Object.entries(t.statuses).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <Drawer
      id="shipment-form-drawer"
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t.editTitle : t.addTitle}
      onSave={handleSave}
      isSaving={isSaving}
      isFormValid={!!formData.carrier?.trim()}
    >
      <div className="space-y-4">
        <Input
          label={t.carrier}
          value={formData.carrier || ''}
          onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
          placeholder={t.carrierPlaceholder}
          required
        />
        
        {isEditing && (
          <Select
            label={t.status}
            value={(formData as UpdateShipmentDto).status || ''}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ShipmentStatus })}
            options={statusOptions}
          />
        )}

        <Input
          label={t.tracking}
          value={formData.tracking_number || ''}
          onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
          placeholder={t.trackingPlaceholder}
        />
        
        <Input
          label={t.url}
          value={formData.tracking_url || ''}
          onChange={(e) => setFormData({ ...formData, tracking_url: e.target.value })}
          placeholder="https://..."
        />
        
        <Input
          label={t.cost}
          type="number"
          step="0.01"
          min="0"
          value={formData.shipping_cost === undefined ? '' : formData.shipping_cost}
          onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
        />
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
          <textarea
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>
    </Drawer>
  );
}
