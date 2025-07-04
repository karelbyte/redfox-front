'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Warehouse } from '@/types/warehouse';
import { WarehouseAdjustmentFormData } from '@/types/warehouse-adjustment';
import { Input, TextArea, Select } from '@/components/atoms';
import { warehouseAdjustmentService } from '@/services';
import { toastService } from '@/services/toast.service';

export interface WarehouseAdjustmentFormProps {
  warehouses: Warehouse[];
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
  initialData?: WarehouseAdjustmentFormData;
}

export interface WarehouseAdjustmentFormRef {
  submit: () => void;
}

interface FormErrors {
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  date?: string;
  description?: string;
}

const WarehouseAdjustmentForm = forwardRef<WarehouseAdjustmentFormRef, WarehouseAdjustmentFormProps>(
  ({ warehouses, onSuccess, onSavingChange, onValidChange, initialData }, ref) => {
    const t = useTranslations('pages.warehouseAdjustments');
    
    const [formData, setFormData] = useState<WarehouseAdjustmentFormData>({
      sourceWarehouseId: initialData?.sourceWarehouseId || '',
      targetWarehouseId: initialData?.targetWarehouseId || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      description: initialData?.description || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const handleInputChange = (field: keyof WarehouseAdjustmentFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.sourceWarehouseId) {
        newErrors.sourceWarehouseId = t('form.validation.sourceWarehouseRequired');
      }

      if (!formData.targetWarehouseId) {
        newErrors.targetWarehouseId = t('form.validation.targetWarehouseRequired');
      }

      if (formData.sourceWarehouseId === formData.targetWarehouseId) {
        newErrors.targetWarehouseId = t('form.validation.differentWarehousesRequired');
      }

      if (!formData.date) {
        newErrors.date = t('form.validation.dateRequired');
      }

      if (!formData.description) {
        newErrors.description = t('form.validation.descriptionRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        await warehouseAdjustmentService.createWarehouseAdjustment(formData);
        toastService.success(t('messages.adjustmentCreated'));
        onSuccess();
      } catch (error) {
        console.error('Error saving adjustment:', error);
        toastService.error(error instanceof Error ? error.message : t('messages.errorCreating'));
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    const warehouseOptions = warehouses.map(warehouse => ({
      value: warehouse.id,
      label: `${warehouse.name} (${warehouse.code})`,
    }));

        return (
      <form className="flex flex-col space-y-6">
        {/* Almacén Fuente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.sourceWarehouse')} *
          </label>
          <Select
            value={formData.sourceWarehouseId}
            onChange={(value) => handleInputChange('sourceWarehouseId', value)}
            options={warehouseOptions}
            placeholder={t('form.placeholders.sourceWarehouse')}
            error={errors.sourceWarehouseId}
          />
        </div>

        {/* Almacén Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.targetWarehouse')} *
          </label>
          <Select
            value={formData.targetWarehouseId}
            onChange={(value) => handleInputChange('targetWarehouseId', value)}
            options={warehouseOptions}
            placeholder={t('form.placeholders.targetWarehouse')}
            error={errors.targetWarehouseId}
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.date')} *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.description')} *
          </label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('form.placeholders.description')}
            rows={4}
            error={errors.description}
          />
        </div>
      </form>
  );
});

WarehouseAdjustmentForm.displayName = 'WarehouseAdjustmentForm';

export default WarehouseAdjustmentForm; 