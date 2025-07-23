'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { warehouseOpeningsService } from '@/services/warehouse-openings.service';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { WarehouseOpeningFormData, WarehouseOpening } from '@/types/warehouse-opening';
import { Warehouse } from '@/types/warehouse';
import { Input, SearchSelect } from '@/components/atoms';

export interface WarehouseOpeningFormProps {
  warehouseId: string;
  warehouse?: Warehouse | null;
  opening?: WarehouseOpening | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface WarehouseOpeningFormRef {
  submit: () => void;
}

interface FormErrors {
  productId?: string;
  quantity?: string;
  price?: string;
}

const WarehouseOpeningForm = forwardRef<WarehouseOpeningFormRef, WarehouseOpeningFormProps>(
  ({ warehouseId, warehouse, opening, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.warehouseOpenings');
    const [formData, setFormData] = useState<WarehouseOpeningFormData>({
      warehouseId: warehouseId,
      productId: '',
      quantity: 0,
      price: 0,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const isSubmittingRef = useRef(false);

    useEffect(() => {
      if (opening) {
        setFormData({
          warehouseId: opening.warehouseId,
          productId: opening.product.id,
          quantity: opening.quantity,
          price: opening.price,
        });
      } else {
        setFormData({
          warehouseId: warehouseId,
          productId: '',
          quantity: 0,
          price: 0,
        });
      }
    }, [opening, warehouseId]);

    // Función para buscar productos - memoizada para evitar llamadas innecesarias
    const searchProducts = useCallback(async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        // Usar la API con el parámetro term para búsquedas reales en el servidor
        const response = await productService.getProducts(1, term.trim());
        const products = response.data || [];
        
        return products.map(product => ({
          id: product.id,
          label: product.name,
          subtitle: `SKU: ${product.sku}`
        }));
      } catch (error) {
        console.error('Error buscando productos:', error);
        return [];
      }
    }, []);

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      // Solo validar productId si no estamos editando (cuando opening es null)
      if (!opening && !formData.productId) {
        newErrors.productId = t('form.errors.productRequired');
        isValid = false;
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = t('form.errors.quantityRequired');
        isValid = false;
      }

      if (!formData.price || formData.price <= 0) {
        newErrors.price = t('form.errors.priceRequired');
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    }, [formData, opening, onValidChange, t]);

    useEffect(() => {
      validateForm();
    }, [validateForm]);

    const formDataRef = useRef(formData);
    const openingRef = useRef(opening);
    const tRef = useRef(t);
    const onSuccessRef = useRef(onSuccess);
    const onSavingChangeRef = useRef(onSavingChange);
    const onValidChangeRef = useRef(onValidChange);

    // Actualizar las refs cuando cambien los valores
    useEffect(() => {
      formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
      openingRef.current = opening;
    }, [opening]);

    useEffect(() => {
      tRef.current = t;
    }, [t]);

    useEffect(() => {
      onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
      onSavingChangeRef.current = onSavingChange;
    }, [onSavingChange]);

    useEffect(() => {
      onValidChangeRef.current = onValidChange;
    }, [onValidChange]);

    const handleSubmit = async () => {
      // Evitar múltiples ejecuciones
      if (isSubmittingRef.current) {
        return;
      }
      
      isSubmittingRef.current = true;

      // Usar los valores de las refs para evitar dependencias
      const currentFormData = formDataRef.current;
      const currentOpening = openingRef.current;
      const currentT = tRef.current;
      const currentOnSuccess = onSuccessRef.current;
      const currentOnSavingChange = onSavingChangeRef.current;
      const currentOnValidChange = onValidChangeRef.current;

      // Validar formulario directamente sin dependencias
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!currentOpening && !currentFormData.productId) {
        newErrors.productId = currentT('form.errors.productRequired');
        isValid = false;
      }

      if (!currentFormData.quantity || currentFormData.quantity <= 0) {
        newErrors.quantity = currentT('form.errors.quantityRequired');
        isValid = false;
      }

      if (!currentFormData.price || currentFormData.price <= 0) {
        newErrors.price = currentT('form.errors.priceRequired');
        isValid = false;
      }

      setErrors(newErrors);
      currentOnValidChange?.(isValid);

      if (!isValid) {
        isSubmittingRef.current = false;
        return;
      }

      try {
        currentOnSavingChange?.(true);
        if (currentOpening) {
          // Editar apertura existente
          await warehouseOpeningsService.updateWarehouseOpening(currentOpening.id, {
            quantity: currentFormData.quantity,
            price: currentFormData.price
          });
          toastService.success(currentT('messages.openingUpdated'));
        } else {
          // Crear nueva apertura
          await warehouseOpeningsService.createWarehouseOpening(currentFormData);
          toastService.success(currentT('messages.openingCreated'));
        }
        currentOnSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(currentOpening ? currentT('messages.errorUpdating') : currentT('messages.errorCreating'));
        }
      } finally {
        currentOnSavingChange?.(false);
        isSubmittingRef.current = false;
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }), []);

    return (
      <form className="space-y-6">
        <div>
          <SearchSelect
            value={formData.productId}
            onChange={(productId) => setFormData(prev => ({ ...prev, productId }))}
            onSearch={searchProducts}
            label={t('form.product')}
            placeholder={t('form.selectProduct')}
            required
            error={errors.productId}
            disabled={!!opening}
          />
        </div>

        <Input
          type="number"
          id="quantity"
          label={t('form.quantity')}
          required
          min="1"
          step="1"
          value={formData.quantity || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
          placeholder={t('form.placeholders.quantity')}
          error={errors.quantity}
        />

        <Input
          type="number"
          id="price"
          label={`${t('form.price')} ${warehouse?.currency ? `(${warehouse.currency.code})` : ''}`}
          required
          min="0.01"
          step="0.01"
          value={formData.price || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder={t('form.placeholders.price')}
          error={errors.price}
        />
      </form>
    );
  }
);

WarehouseOpeningForm.displayName = 'WarehouseOpeningForm';

export default WarehouseOpeningForm; 