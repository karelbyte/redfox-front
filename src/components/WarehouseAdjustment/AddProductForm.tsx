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

interface ProductPrice {
  id: string;
  name: string;
  price: number;
}

interface InventoryProduct {
  product: {
    id: string;
    name: string;
    sku: string;
    base_price: number;
    prices?: ProductPrice[];
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
    const [selectedPriceId, setSelectedPriceId] = useState<string>('base');

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
      if (!sourceWarehouseId) return [];

      try {
        const response = await inventoryService.getInventory(sourceWarehouseId, 1, term);
        const availableProducts = (response.data || []).filter(item => item.quantity > 0);

        return availableProducts.map(item => ({
          id: item.product.id,
          label: item.product.name,
          subtitle: `SKU: ${item.product.sku} - Stock: ${item.quantity}`,
        }));
      } catch {
        return [];
      }
    };

    // Obtener el producto seleccionado con sus precios
    const getSelectedProduct = async (productId: string): Promise<InventoryProduct | null> => {
      if (!sourceWarehouseId || !productId) return null;

      try {
        const response = await inventoryService.getInventory(sourceWarehouseId, 1);
        const product = (response.data || []).find(item => item.product.id === productId);
        return product as InventoryProduct | null;
      } catch {
        return null;
      }
    };

    // Cuando cambia el producto seleccionado, cargar sus precios y preseleccionar el base
    useEffect(() => {
      if (formData.productId && !adjustmentDetail) {
        getSelectedProduct(formData.productId).then(product => {
          setCurrentProduct(product);
          if (product) {
            setSelectedPriceId('base');
            setFormData(prev => ({ ...prev, price: Number(product.product.base_price) }));
          }
        });
      } else if (!formData.productId) {
        setCurrentProduct(null);
        setSelectedPriceId('base');
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.productId, sourceWarehouseId]);

    // Construir lista de opciones de precio
    const priceOptions = currentProduct
      ? [
          { id: 'base', name: 'Precio base', price: Number(currentProduct.product.base_price) },
          ...(currentProduct.product.prices || []).map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
          })),
        ]
      : [];

    const handlePriceSelect = (priceId: string) => {
      setSelectedPriceId(priceId);
      const option = priceOptions.find(p => p.id === priceId);
      if (option) {
        setFormData(prev => ({ ...prev, price: option.price }));
      }
    };

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
          stock: currentProduct.quantity,
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
      if (!validateForm()) return null;

      try {
        onSavingChange?.(true);
        return {
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
        };
      } catch {
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
        {/* Selector de producto */}
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

        {/* Stock disponible */}
        {currentProduct && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Stock disponible:</span> {currentProduct.quantity} unidades
            </p>
          </div>
        )}

        {/* Selector de precio — solo si hay producto seleccionado y tiene precios */}
        {currentProduct && priceOptions.length > 0 && !adjustmentDetail && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.selectPrice')} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {priceOptions.map(option => (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPriceId === option.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={
                    selectedPriceId === option.id
                      ? { borderColor: `rgb(var(--color-primary-500))`, backgroundColor: `rgb(var(--color-primary-50))` }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="price_option"
                      value={option.id}
                      checked={selectedPriceId === option.id}
                      onChange={() => handlePriceSelect(option.id)}
                      className="text-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{option.name}</span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: `rgb(var(--color-primary-700))` }}
                  >
                    ${Number(option.price).toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Cantidad */}
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

        {/* Precio — editable para ajuste fino */}
        <Input
          type="number"
          id="price"
          label={t('form.price')}
          required
          value={formData.price}
          onChange={(e) => {
            setSelectedPriceId('custom');
            setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
          }}
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
