'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { inventoryService } from '@/services';
import { WarehouseAdjustmentDetail, WarehouseAdjustmentDetailFormData } from '@/types/warehouse-adjustment';
import { Input, SearchSelect } from '@/components/atoms';

export interface AddProductFormProps {
  adjustmentDetail?: WarehouseAdjustmentDetail | null;
  sourceWarehouseId?: string;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface AddProductFormRef {
  submit: () => Promise<WarehouseAdjustmentDetailFormData | null>;
  getFormData: () => WarehouseAdjustmentDetailFormData;
}

interface FormErrors {
  productId?: string;
  quantity?: string;
  price?: string;
}

interface InventoryProduct {
  product: {
    id: string;
    name: string;
    sku: string;
  };
  quantity: number;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ adjustmentDetail, sourceWarehouseId, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.warehouseAdjustments.addProduct');
    const [formData, setFormData] = useState<WarehouseAdjustmentDetailFormData>({
      productId: '',
      quantity: 0,
      price: 0,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [currentProduct, setCurrentProduct] = useState<InventoryProduct | null>(null);

    // Cargar datos del producto a editar
    useEffect(() => {
      if (adjustmentDetail) {
        setFormData({
          productId: adjustmentDetail.product.id,
          quantity: adjustmentDetail.quantity,
          price: adjustmentDetail.price,
        });
      }
    }, [adjustmentDetail]);

    // Función para buscar productos del inventario del almacén fuente
    const searchProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      if (!sourceWarehouseId) {
        return [];
      }

      try {
        // Hacer llamada paginada al backend con el término de búsqueda
        const response = await inventoryService.getInventory(sourceWarehouseId, 1, term);
        const inventoryProductsData = response.data || [];
        
        // Solo mostrar productos con stock disponible
        const availableProducts = inventoryProductsData.filter(item => item.quantity > 0);

        return availableProducts.map(item => ({
          id: item.product.id,
          label: item.product.name,
          subtitle: `SKU: ${item.product.sku} - Stock: ${item.quantity}`
        }));
      } catch (error) {
        console.error('Error buscando productos del inventario:', error);
        return [];
      }
    };

    // Función para obtener el producto seleccionado y su stock
    const getSelectedProductStock = async (productId: string): Promise<InventoryProduct | null> => {
      if (!sourceWarehouseId || !productId) return null;

      try {
        // Buscar el producto específico por su ID
        const response = await inventoryService.getInventory(sourceWarehouseId, 1);
        const inventoryProductsData = response.data || [];
        
        const product = inventoryProductsData.find(item => item.product.id === productId);
        return product || null;
      } catch (error) {
        console.error('Error obteniendo stock del producto:', error);
        return null;
      }
    };

    // Actualizar producto seleccionado cuando cambia el productId
    useEffect(() => {
      if (formData.productId) {
        getSelectedProductStock(formData.productId).then(product => {
          setCurrentProduct(product);
        });
      } else {
        setCurrentProduct(null);
      }
    }, [formData.productId, sourceWarehouseId]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.productId) {
        newErrors.productId = t('validation.productRequired');
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = formData.quantity <= 0 
          ? t('validation.quantityPositive') 
          : t('validation.quantityRequired');
      } else if (currentProduct && formData.quantity > currentProduct.quantity) {
        newErrors.quantity = t('validation.quantityExceedsStock', { 
          stock: currentProduct.quantity 
        });
      }

      if (!formData.price || formData.price <= 0) {
        newErrors.price = formData.price <= 0 
          ? t('validation.pricePositive') 
          : t('validation.priceRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, currentProduct]);

    const handleSubmit = async (): Promise<WarehouseAdjustmentDetailFormData | null> => {
      if (!validateForm()) {
        return null;
      }

      try {
        onSavingChange?.(true);
        const data = {
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
        };

        return data;
      } catch (error) {
        console.error('Error submitting form:', error);
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
        <SearchSelect
          value={formData.productId}
          onChange={(productId) => setFormData(prev => ({ ...prev, productId }))}
          onSearch={searchProducts}
          label={t('form.product')}
          placeholder={t('form.selectProduct')}
          required
          error={errors.productId}
          disabled={!!adjustmentDetail}
        />

        {/* Información del stock disponible */}
        {currentProduct && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Stock disponible:</span> {currentProduct.quantity} unidades
            </p>
          </div>
        )}

        <Input
          type="number"
          id="quantity"
          label={t('form.quantity')}
          required
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
          placeholder={t('form.placeholders.quantity')}
          error={errors.quantity}
          step="1"
          min="1"
          max={currentProduct?.quantity || undefined}
        />

        <Input
          type="number"
          id="price"
          label={t('form.price')}
          required
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          placeholder={t('form.placeholders.price')}
          error={errors.price}
          step="0.01"
          min="0"
        />
      </form>
    );
  }
);

AddProductForm.displayName = 'AddProductForm';

export default AddProductForm; 