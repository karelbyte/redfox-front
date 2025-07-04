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
  code?: string;
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  date?: string;
  description?: string;
}

const WarehouseAdjustmentForm = forwardRef<WarehouseAdjustmentFormRef, WarehouseAdjustmentFormProps>(
  ({ warehouses, onSuccess, onSavingChange, onValidChange, initialData }, ref) => {
    const t = useTranslations('pages.warehouseAdjustments');
    
    const [formData, setFormData] = useState<WarehouseAdjustmentFormData>({
      code: initialData?.code || '',
      sourceWarehouseId: initialData?.sourceWarehouseId || '',
      targetWarehouseId: initialData?.targetWarehouseId || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      description: initialData?.description || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Obtener información de los almacenes seleccionados
    const selectedSourceWarehouse = warehouses.find(w => w.id === formData.sourceWarehouseId);
    const selectedTargetWarehouse = warehouses.find(w => w.id === formData.targetWarehouseId);

    const handleInputChange = (field: keyof WarehouseAdjustmentFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.code.trim()) {
        newErrors.code = t('form.validation.codeRequired');
      }

      if (!formData.sourceWarehouseId) {
        newErrors.sourceWarehouseId = t('form.validation.sourceWarehouseRequired');
      }

      if (!formData.targetWarehouseId) {
        newErrors.targetWarehouseId = t('form.validation.targetWarehouseRequired');
      }

      // Validar que los almacenes sean diferentes
      if (formData.sourceWarehouseId && formData.targetWarehouseId && 
          formData.sourceWarehouseId === formData.targetWarehouseId) {
        newErrors.targetWarehouseId = t('form.validation.differentWarehousesRequired');
      }

      // Validar que las monedas coincidan
      if (selectedSourceWarehouse && selectedTargetWarehouse && 
          selectedSourceWarehouse.currencyId !== selectedTargetWarehouse.currencyId) {
        newErrors.targetWarehouseId = t('form.validation.sameCurrencyRequired');
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
        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.code')} *
          </label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder={t('form.placeholders.code')}
            error={errors.code}
          />
        </div>

        {/* Almacén Fuente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.sourceWarehouse')} *
          </label>
          <Select
            value={formData.sourceWarehouseId}
            onChange={(e) => handleInputChange('sourceWarehouseId', e.target.value)}
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
            onChange={(e) => handleInputChange('targetWarehouseId', e.target.value)}
            options={warehouseOptions}
            placeholder={t('form.placeholders.targetWarehouse')}
            error={errors.targetWarehouseId}
          />
        </div>

        {/* Información de los almacenes seleccionados */}
        {(selectedSourceWarehouse || selectedTargetWarehouse) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t('form.warehouseInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del almacén fuente */}
              {selectedSourceWarehouse && (
                <div className="bg-white p-3 rounded border">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">
                    {t('form.sourceWarehouse')}
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Código:</span> {selectedSourceWarehouse.code}</p>
                    <p><span className="font-medium">Nombre:</span> {selectedSourceWarehouse.name}</p>
                    <p><span className="font-medium">Moneda:</span> {selectedSourceWarehouse.currency.code} - {selectedSourceWarehouse.currency.name}</p>
                    <p><span className="font-medium">Estado:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded ${
                        selectedSourceWarehouse.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedSourceWarehouse.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Información del almacén destino */}
              {selectedTargetWarehouse && (
                <div className="bg-white p-3 rounded border">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">
                    {t('form.targetWarehouse')}
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Código:</span> {selectedTargetWarehouse.code}</p>
                    <p><span className="font-medium">Nombre:</span> {selectedTargetWarehouse.name}</p>
                    <p><span className="font-medium">Moneda:</span> {selectedTargetWarehouse.currency.code} - {selectedTargetWarehouse.currency.name}</p>
                    <p><span className="font-medium">Estado:</span> 
                      <span className={`ml-1 px-2 py-1 text-xs rounded ${
                        selectedTargetWarehouse.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedTargetWarehouse.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Validación de monedas */}
            {selectedSourceWarehouse && selectedTargetWarehouse && (
              <div className="mt-3 p-3 rounded border-l-4 bg-blue-50 border-blue-400">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    selectedSourceWarehouse.currencyId === selectedTargetWarehouse.currencyId
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">
                    {selectedSourceWarehouse.currencyId === selectedTargetWarehouse.currencyId
                      ? t('form.validation.currenciesMatch')
                      : t('form.validation.currenciesMismatch')
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

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