'use client';

import { forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ReturnDetailFormData, ReturnDetail } from '@/types/return';
import { Input, SearchSelect } from '@/components/atoms';
import { inventoryService } from '@/services';
import { InventoryItem } from '@/types/inventory';

export interface AddProductFormRef {
  submit: () => Promise<ReturnDetailFormData | null>;
}

interface AddProductFormProps {
  sourceWarehouseId: string;
  returnDetail?: ReturnDetail;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (saving: boolean) => void;
  onValidChange: (valid: boolean) => void;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ sourceWarehouseId, returnDetail, onValidChange }, ref) => {
    const t = useTranslations('pages.returns.addProduct');
    const [formData, setFormData] = useState<ReturnDetailFormData>({
      productId: '',
      quantity: 0,
      price: 0
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState<InventoryItem | null>(null);

    // Cargar datos del producto a editar SOLO cuando cambia el producto
    useEffect(() => {
      if (returnDetail) {
        setFormData({
          productId: returnDetail.product.id,
          quantity: returnDetail.quantity,
          price: returnDetail.price
        });
        // Cargar la información del inventario solo si cambia el producto
        const loadInventoryInfo = async () => {
          const inventoryProduct = await getInventoryProductById(returnDetail.product.id);
          if (inventoryProduct) {
            setSelectedInventoryProduct(inventoryProduct);
          }
        };
        loadInventoryInfo();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnDetail?.product.id]);

    // Función para obtener el producto de inventario completo cuando se selecciona
    const getInventoryProductById = useCallback(async (productId: string): Promise<InventoryItem | null> => {
      try {
        const response = await inventoryService.getInventory(sourceWarehouseId, 1, '');
        const foundProduct = response.data.find(inv => inv.product.id === productId);
        return foundProduct || null;
      } catch (error) {
        console.error('Error obteniendo producto de inventario:', error);
        return null;
      }
    }, [sourceWarehouseId]);

    // Función para buscar productos en inventario del almacén específico
    const searchInventoryProducts = useCallback(async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await inventoryService.getInventory(sourceWarehouseId, 1, term);
        return (response.data || []).map(inventoryProduct => ({
          id: inventoryProduct.product.id,
          label: inventoryProduct.product.name,
          subtitle: `SKU: ${inventoryProduct.product.sku} | Stock: ${inventoryProduct.quantity}`
        }));
      } catch (error) {
        console.error('Error buscando productos en inventario:', error);
        return [];
      }
    }, [sourceWarehouseId]);

    const handleProductSelection = useCallback(async (productId: string) => {
      setFormData(prev => ({ ...prev, productId }));
      
      if (productId) {
        const inventoryProduct = await getInventoryProductById(productId);
        if (inventoryProduct) {
          setSelectedInventoryProduct(inventoryProduct);
          setFormData(prev => ({ 
            ...prev, 
            productId,
            price: inventoryProduct.price 
          }));
        }
      } else {
        setSelectedInventoryProduct(null);
      }
    }, [getInventoryProductById]);

    // Validar formulario usando useMemo para evitar recálculos innecesarios
    const validationResult = useMemo(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.productId) {
        newErrors.productId = t('validation.productRequired');
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = t('validation.quantityPositive');
      } else if (selectedInventoryProduct && formData.quantity > selectedInventoryProduct.quantity) {
        newErrors.quantity = t('validation.quantityExceedsStock', { 
          stock: selectedInventoryProduct.quantity 
        });
      }

      if (!formData.price || formData.price <= 0) {
        newErrors.price = t('validation.pricePositive');
      }

      return { errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
    }, [formData, selectedInventoryProduct, t]);

    // Actualizar errores y validación solo cuando cambia el resultado
    useEffect(() => {
      setErrors(validationResult.errors);
      onValidChange(validationResult.isValid);
    }, [validationResult, onValidChange]);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const handleSubmit = useCallback(async (): Promise<ReturnDetailFormData | null> => {
      if (!validationResult.isValid) {
        return null;
      }

      // Nos aseguramos que price sea un número
      return {
        ...formData,
        price: Number(formData.price)
      };
    }, [formData, validationResult.isValid]);

    // Exponer método submit usando useImperativeHandle
    useEffect(() => {
      if (ref) {
        (ref as React.RefObject<AddProductFormRef>).current = {
          submit: handleSubmit
        };
      }
    }, [ref, handleSubmit]);

    return (
      <form className="space-y-6">
        <SearchSelect
          value={formData.productId}
          onChange={handleProductSelection}
          onSearch={searchInventoryProducts}
          label={t('form.product')}
          placeholder={t('form.selectProduct')}
          required
          error={errors.productId}
          disabled={!!returnDetail}
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
                <p className="font-medium">{selectedInventoryProduct.quantity} {typeof selectedInventoryProduct.product.measurement_unit === 'object' ? selectedInventoryProduct.product.measurement_unit.code : 'pz'}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.inventoryPrice')}:</span>
                <p className="font-medium">{formatCurrency(selectedInventoryProduct.price)}</p>
              </div>
              <div>
                <span className="text-gray-500">{t('inventoryInfo.warehouse')}:</span>
                <p className="font-medium">{selectedInventoryProduct.warehouse.name}</p>
              </div>
              {selectedInventoryProduct.product.category && (
                <div>
                  <span className="text-gray-500">{t('inventoryInfo.category')}:</span>
                  <p className="font-medium">{typeof selectedInventoryProduct.product.category === 'object' ? selectedInventoryProduct.product.category.name : selectedInventoryProduct.product.category}</p>
                </div>
              )}
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