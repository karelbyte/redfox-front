'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
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
        toastService.error('Error al cargar productos');
      } finally {
        setLoadingProducts(false);
      }
    };

    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      // Solo validar productId si no estamos editando (cuando opening es null)
      if (!opening && !formData.productId) {
        newErrors.productId = 'El producto es requerido';
        isValid = false;
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = 'La cantidad debe ser mayor a 0';
        isValid = false;
      }

      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'El precio debe ser mayor a 0';
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    }, [formData, opening, onValidChange]);

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
          toastService.success('Apertura actualizada correctamente');
        } else {
          // Crear nueva apertura
          await warehouseOpeningsService.createWarehouseOpening(formData);
          toastService.success('Apertura creada correctamente');
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(opening ? 'Error al actualizar la apertura' : 'Error al crear la apertura');
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
            Producto <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
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
              <option value="">Seleccionar producto...</option>
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
          label="Cantidad"
          required
          min="1"
          step="1"
          value={formData.quantity || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
          placeholder="Ej: 100"
          error={errors.quantity}
        />

        <Input
          type="number"
          id="price"
          label={`Precio ${warehouse?.currency ? `(${warehouse.currency.code})` : ''}`}
          required
          min="0.01"
          step="0.01"
          value={formData.price || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder="Ej: 25.50"
          error={errors.price}
        />
      </form>
    );
  }
);

WarehouseOpeningForm.displayName = 'WarehouseOpeningForm';

export default WarehouseOpeningForm; 