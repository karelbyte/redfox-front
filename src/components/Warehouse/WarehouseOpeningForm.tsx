'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { warehouseOpeningsService } from '@/services/warehouse-openings.service';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { WarehouseOpeningFormData, WarehouseOpening } from '@/types/warehouse-opening';
import { Product } from '@/types/product';
import { Warehouse } from '@/types/warehouse';
import { Input } from '@/components/atoms';

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

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productService.getProducts(1);
        setProducts(response.data);
      } catch {
        toastService.error(t('messages.errorLoadingProducts'));
      } finally {
        setLoadingProducts(false);
      }
    };

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

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        if (opening) {
          // Editar apertura existente
          await warehouseOpeningsService.updateWarehouseOpening(opening.id, {
            quantity: formData.quantity,
            price: formData.price
          });
          toastService.success(t('messages.openingUpdated'));
        } else {
          // Crear nueva apertura
          await warehouseOpeningsService.createWarehouseOpening(formData);
          toastService.success(t('messages.openingCreated'));
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(opening ? t('messages.errorUpdating') : t('messages.errorCreating'));
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-6">
        <div>
          <label 
            htmlFor="productId" 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {t('form.product')} <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
          </label>
          {loadingProducts ? (
            <div 
              className="animate-pulse h-12 rounded-lg"
              style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
            ></div>
          ) : (
            <select
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              className={`appearance-none block w-full px-4 py-3 border rounded-lg text-black focus:outline-none transition-colors ${
                opening 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'focus:ring-1 focus:border-gray-400'
              }`}
              style={{
                borderColor: opening ? '#d1d5db' : `rgb(var(--color-primary-300))`,
              }}
              disabled={!!opening}
              required
            >
              <option value="">{t('form.selectProduct')}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku}
                </option>
              ))}
            </select>
          )}
          {errors.productId && (
            <p 
              className="mt-1 text-xs"
              style={{ color: `rgb(var(--color-primary-600))` }}
            >
              {errors.productId}
            </p>
          )}
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