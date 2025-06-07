'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { warehouseOpeningsService } from '@/services/warehouse-openings.service';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { WarehouseOpeningFormData, WarehouseOpening } from '@/types/warehouse-opening';
import { Product } from '@/types/product';
import { Warehouse } from '@/types/warehouse';

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

    const validateForm = (): boolean => {
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
    };

    useEffect(() => {
      validateForm();
    }, [formData]);

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
          <label htmlFor="productId" className="block text-sm font-medium text-red-400 mb-2">
            Producto <span className="text-red-500">*</span>
          </label>
          {loadingProducts ? (
            <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
          ) : (
            <select
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              className={`appearance-none block w-full px-4 py-3 border rounded-lg text-black focus:outline-none transition-colors ${
                opening 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'border-red-300 placeholder-red-200 focus:ring-1 focus:ring-red-300 focus:border-red-300'
              }`}
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
          {errors.productId && <p className="mt-1 text-xs text-gray-300">{errors.productId}</p>}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-red-400 mb-2">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            step="1"
            value={formData.quantity || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: 100"
            required
          />
          {errors.quantity && <p className="mt-1 text-xs text-gray-300">{errors.quantity}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-red-400 mb-2">
            Precio {warehouse?.currency && `(${warehouse.currency.code})`} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            min="0.01"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: 25.50"
            required
          />
          {errors.price && <p className="mt-1 text-xs text-gray-300">{errors.price}</p>}
        </div>
      </form>
    );
  }
);

WarehouseOpeningForm.displayName = 'WarehouseOpeningForm';

export default WarehouseOpeningForm; 