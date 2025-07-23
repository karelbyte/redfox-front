'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { PurchaseOrder, PurchaseOrderFormData } from '@/types/purchase-order';
import { providersService, warehousesService } from '@/services';
import { toastService } from '@/services';
import { Input, SearchSelect, TextArea } from '@/components/atoms';

export interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface PurchaseOrderFormRef {
  submit: () => Promise<PurchaseOrderFormData | null>;
  getFormData: () => PurchaseOrderFormData;
}

interface FormErrors {
  code?: string;
  date?: string;
  provider_id?: string;
  warehouse_id?: string;
  document?: string;
  expected_delivery_date?: string;
}

const PurchaseOrderForm = forwardRef<PurchaseOrderFormRef, PurchaseOrderFormProps>(
  ({ purchaseOrder, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.purchaseOrders');
    const [formData, setFormData] = useState<PurchaseOrderFormData>({
      code: '',
      date: '',
      provider_id: '',
      warehouse_id: '',
      document: '',
      amount: 0,
      notes: '',
      expected_delivery_date: '',
      status: 'PENDING'
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Cargar datos de la orden a editar
    useEffect(() => {
      if (purchaseOrder) {
        setFormData({
          code: purchaseOrder.code,
          date: purchaseOrder.date,
          provider_id: purchaseOrder.provider.id,
          warehouse_id: purchaseOrder.warehouse.id,
          document: purchaseOrder.document,
          amount: purchaseOrder.amount,
          notes: purchaseOrder.notes || '',
          expected_delivery_date: purchaseOrder.expected_delivery_date,
          status: purchaseOrder.status
        });
      }
    }, [purchaseOrder]);

    // Función para buscar proveedores
    const searchProviders = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await providersService.getProviders();
        const providers = response.data || [];
        
        // Si no hay término de búsqueda, devolver todos los proveedores
        if (!term.trim()) {
          return providers.map(provider => ({
            id: provider.id,
            label: provider.name,
            subtitle: `Código: ${provider.code}`
          }));
        }
        
        // Filtrar por término de búsqueda
        return providers
          .filter(provider => 
            provider.name.toLowerCase().includes(term.toLowerCase()) ||
            provider.code.toLowerCase().includes(term.toLowerCase())
          )
          .map(provider => ({
            id: provider.id,
            label: provider.name,
            subtitle: `Código: ${provider.code}`
          }));
      } catch (error) {
        console.error('Error buscando proveedores:', error);
        return [];
      }
    };

    // Función para buscar almacenes
    const searchWarehouses = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await warehousesService.getWarehouses({});
        const warehouses = response.data || [];
        
        // Si no hay término de búsqueda, devolver todos los almacenes
        if (!term.trim()) {
          return warehouses.map(warehouse => ({
            id: warehouse.id,
            label: warehouse.name,
            subtitle: `Código: ${warehouse.code}`
          }));
        }
        
        // Filtrar por término de búsqueda
        return warehouses
          .filter(warehouse => 
            warehouse.name.toLowerCase().includes(term.toLowerCase()) ||
            warehouse.code.toLowerCase().includes(term.toLowerCase())
          )
          .map(warehouse => ({
            id: warehouse.id,
            label: warehouse.name,
            subtitle: `Código: ${warehouse.code}`
          }));
      } catch (error) {
        console.error('Error buscando almacenes:', error);
        return [];
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.code.trim()) {
        newErrors.code = t('form.validation.codeRequired');
      }

      if (!formData.date) {
        newErrors.date = t('form.validation.dateRequired');
      }

      if (!formData.provider_id) {
        newErrors.provider_id = t('form.validation.providerRequired');
      }

      if (!formData.warehouse_id) {
        newErrors.warehouse_id = t('form.validation.warehouseRequired');
      }

      if (!formData.document.trim()) {
        newErrors.document = t('form.validation.documentRequired');
      }

      if (!formData.expected_delivery_date) {
        newErrors.expected_delivery_date = t('form.validation.expectedDeliveryDateRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        validateForm();
      }, 300); // Debounce de 300ms para evitar validaciones excesivas

      return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleSubmit = async (): Promise<PurchaseOrderFormData | null> => {
      if (!validateForm()) {
        return null;
      }

      try {
        onSavingChange?.(true);
        const result = {
          ...formData,
          code: formData.code.trim(),
          document: formData.document.trim(),
          notes: formData.notes?.trim() || ''
        };
        return result;
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(t('messages.errorCreating'));
        }
        return null;
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      getFormData: () => formData,
    }));

    return (
      <form className="space-y-6">
        <div className="space-y-6">
          {/* Código */}
          <div>
            <Input
              label={t('form.code')}
              placeholder={t('form.placeholders.code')}
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              error={errors.code}
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <Input
              type="date"
              label={t('form.date')}
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              error={errors.date}
              required
            />
          </div>

          {/* Proveedor */}
          <div>
            <SearchSelect
              value={formData.provider_id}
              onChange={(providerId) => setFormData(prev => ({ ...prev, provider_id: providerId }))}
              onSearch={searchProviders}
              label={t('form.provider')}
              placeholder={t('form.placeholders.provider')}
              required
              error={errors.provider_id}
            />
          </div>

          {/* Almacén */}
          <div>
            <SearchSelect
              value={formData.warehouse_id}
              onChange={(warehouseId) => setFormData(prev => ({ ...prev, warehouse_id: warehouseId }))}
              onSearch={searchWarehouses}
              label={t('form.warehouse')}
              placeholder={t('form.placeholders.warehouse')}
              required
              error={errors.warehouse_id}
            />
          </div>

          {/* Documento */}
          <div>
            <Input
              label={t('form.document')}
              placeholder={t('form.placeholders.document')}
              value={formData.document}
              onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
              error={errors.document}
              required
            />
          </div>

          {/* Fecha de Entrega Esperada */}
          <div>
            <Input
              type="date"
              label={t('form.expectedDeliveryDate')}
              value={formData.expected_delivery_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
              error={errors.expected_delivery_date}
              required
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <TextArea
            label={t('form.notes')}
            placeholder={t('form.placeholders.notes')}
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>
      </form>
    );
  }
);

PurchaseOrderForm.displayName = 'PurchaseOrderForm';

export default PurchaseOrderForm; 