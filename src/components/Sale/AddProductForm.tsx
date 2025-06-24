'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { inventoryService, InventoryProduct } from '@/services/inventory.service';
import { toastService } from '@/services/toast.service';
import { SaleDetail, SaleDetailFormData } from '@/types/sale';
import { Input, SearchSelect } from '@/components/atoms';

export interface AddProductFormProps {
  saleDetail?: SaleDetail | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface AddProductFormRef {
  submit: () => Promise<SaleDetailFormData | null>;
  getFormData: () => SaleDetailFormData;
}

interface FormErrors {
  product_id?: string;
  quantity?: string;
  price?: string;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ saleDetail, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.sales.addProduct');
    const [formData, setFormData] = useState<SaleDetailFormData>({
      product_id: '',
      quantity: 0,
      price: 0,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState<InventoryProduct | null>(null);

    // Cargar datos del producto a editar
    useEffect(() => {
      if (saleDetail) {
        setFormData({
          product_id: saleDetail.product.id,
          quantity: saleDetail.quantity,
          price: saleDetail.price,
        });
      }
    }, [saleDetail]);

    // Función para buscar productos en inventario
    const searchInventoryProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await inventoryService.getInventoryProducts(1, term);
        return (response.data || []).map(inventoryProduct => ({
          id: inventoryProduct.product.id,
          label: inventoryProduct.product.name,
          subtitle: `SKU: ${inventoryProduct.product.sku} | Stock: ${inventoryProduct.quantity}`
        }));
      } catch (error) {
        console.error('Error buscando productos en inventario:', error);
        return [];
      }
    };

    // Función para obtener el producto de inventario completo cuando se selecciona
    const getInventoryProductById = async (productId: string): Promise<InventoryProduct | null> => {
      try {
        const response = await inventoryService.getInventoryProducts(1, '');
        const foundProduct = response.data.find(inv => inv.product.id === productId);
        return foundProduct || null;
      } catch (error) {
        console.error('Error obteniendo producto de inventario:', error);
        return null;
      }
    };

    // Manejar selección de producto
    const handleProductSelection = async (productId: string) => {
      setFormData(prev => ({ ...prev, product_id: productId }));
      
      if (productId) {
        const inventoryProduct = await getInventoryProductById(productId);
        if (inventoryProduct) {
          setSelectedInventoryProduct(inventoryProduct);
          // Establecer el precio del inventario como precio por defecto
          setFormData(prev => ({ 
            ...prev, 
            product_id: productId,
            price: inventoryProduct.price 
          }));
        }
      } else {
        setSelectedInventoryProduct(null);
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.product_id) {
        newErrors.product_id = t('form.errors.productRequired');
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = formData.quantity <= 0 
          ? t('form.errors.quantityPositive') 
          : t('form.errors.quantityRequired');
      }

      if (!formData.price || formData.price <= 0) {
        newErrors.price = formData.price <= 0 
          ? t('form.errors.pricePositive') 
          : t('form.errors.priceRequired');
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

    const handleSubmit = async (): Promise<SaleDetailFormData | null> => {
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
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(t('messages.errorAdding'));
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

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    return (
      <form className="space-y-6">
        <SearchSelect
          value={formData.product_id}
          onChange={handleProductSelection}
          onSearch={searchInventoryProducts}
          label={t('form.product')}
          placeholder={t('form.selectProduct')}
          required
          error={errors.product_id}
          disabled={!!saleDetail}
        />

        {/* Tarjeta de información del producto seleccionado */}
        {selectedInventoryProduct && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t('inventoryInfo.title')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('inventoryInfo.product')}:</span>
                <p className="font-medium">{selectedInventoryProduct.product.name}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.sku')}:</span>
                <p className="font-medium">{selectedInventoryProduct.product.sku}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.stockAvailable')}:</span>
                <p className="font-medium">{selectedInventoryProduct.quantity} {selectedInventoryProduct.product.measurement_unit.symbol}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.inventoryPrice')}:</span>
                <p className="font-medium">{formatCurrency(selectedInventoryProduct.price)}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.warehouse')}:</span>
                <p className="font-medium">{selectedInventoryProduct.warehouse.name}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.category')}:</span>
                <p className="font-medium">{selectedInventoryProduct.product.category.name}</p>
              </div>
            </div>
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
          step="0.01"
          min="0"
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