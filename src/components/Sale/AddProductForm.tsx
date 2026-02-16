'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
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

interface ProductDrawerData {
  product_id: string;
  quantity: number;
  price_id: string;
  custom_price: number;
  warehouse_id: string;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ saleDetail, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.sales.addProduct');
    const { formatCurrency } = useLocaleUtils();
    const [formData, setFormData] = useState<SaleDetailFormData>({
      product_id: '',
      quantity: 0,
      price: 0,
      warehouse_id: '',
    });

    const [productDrawerData, setProductDrawerData] = useState<ProductDrawerData>({
      product_id: '',
      quantity: 0,
      price_id: 'base',
      custom_price: 0,
      warehouse_id: '',
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
          warehouse_id: '', // Se establecerá cuando se cargue la información del inventario
        });

        setProductDrawerData({
          product_id: saleDetail.product.id,
          quantity: saleDetail.quantity,
          price_id: 'custom',
          custom_price: saleDetail.price,
          warehouse_id: '',
        });
        
        // Cargar la información del inventario para obtener el warehouse_id
        const loadInventoryInfo = async () => {
          const inventoryProduct = await getInventoryProductById(saleDetail.product.id);
          if (inventoryProduct) {
            setSelectedInventoryProduct(inventoryProduct);
            setFormData(prev => ({
              ...prev,
              warehouse_id: inventoryProduct.warehouse.id
            }));
            setProductDrawerData(prev => ({
              ...prev,
              warehouse_id: inventoryProduct.warehouse.id
            }));
          }
        };
        
        loadInventoryInfo();
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
      setProductDrawerData(prev => ({ ...prev, product_id: productId }));
      
      if (productId) {
        const inventoryProduct = await getInventoryProductById(productId);
        if (inventoryProduct) {
          setSelectedInventoryProduct(inventoryProduct);
          // Establecer el precio base como precio por defecto y el warehouse_id
          setFormData(prev => ({ 
            ...prev, 
            product_id: productId,
            price: inventoryProduct.product.base_price,
            warehouse_id: inventoryProduct.warehouse.id
          }));
          setProductDrawerData(prev => ({
            ...prev,
            product_id: productId,
            price_id: 'base',
            custom_price: 0,
            warehouse_id: inventoryProduct.warehouse.id
          }));
        }
      } else {
        setSelectedInventoryProduct(null);
        setFormData(prev => ({ ...prev, warehouse_id: '' }));
        setProductDrawerData(prev => ({ ...prev, warehouse_id: '' }));
      }
    };

    // Manejar cambio de precio seleccionado
    const handlePriceChange = (priceId: string) => {
      if (!selectedInventoryProduct) return;

      let finalPrice = 0;
      
      if (priceId === 'base') {
        finalPrice = selectedInventoryProduct.product.base_price;
      } else if (priceId === 'custom') {
        finalPrice = productDrawerData.custom_price || selectedInventoryProduct.product.base_price;
      } else {
        const selectedPrice = selectedInventoryProduct.product.prices?.find(p => p.id === priceId);
        finalPrice = selectedPrice?.price || 0;
      }

      setProductDrawerData(prev => ({
        ...prev,
        price_id: priceId,
        custom_price: priceId === 'custom' ? (prev.custom_price || selectedInventoryProduct.product.base_price) : 0
      }));

      setFormData(prev => ({
        ...prev,
        price: finalPrice
      }));
    };

    // Manejar cambio de precio personalizado
    const handleCustomPriceChange = (value: number) => {
      setProductDrawerData(prev => ({
        ...prev,
        custom_price: value
      }));
      setFormData(prev => ({
        ...prev,
        price: value
      }));
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
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData(prev => ({ ...prev, quantity: value }));
            setProductDrawerData(prev => ({ ...prev, quantity: value }));
          }}
          placeholder={t('form.placeholders.quantity')}
          error={errors.quantity}
          step="0.01"
          min="0"
        />

        {/* Selector de precio */}
        {selectedInventoryProduct && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('form.priceList')}
            </label>
            <div className="space-y-2">
              {/* Precio Base - Siempre se muestra primero */}
              <label
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: productDrawerData.price_id === 'base' ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                  backgroundColor: productDrawerData.price_id === 'base' ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="price"
                  value="base"
                  checked={productDrawerData.price_id === 'base'}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{t('form.basePrice')}</span>
                    <span className="text-sm font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                      {formatCurrency(selectedInventoryProduct.product.base_price)}
                    </span>
                  </div>
                </div>
              </label>

              {/* Lista de precios adicionales */}
              {selectedInventoryProduct.product.prices && selectedInventoryProduct.product.prices.length > 0 && 
                selectedInventoryProduct.product.prices.map((price) => (
                  <label
                    key={price.id}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: productDrawerData.price_id === price.id ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                      backgroundColor: productDrawerData.price_id === price.id ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="price"
                      value={price.id}
                      checked={productDrawerData.price_id === price.id}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{price.name}</span>
                        <span className="text-sm font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                          {formatCurrency(price.price)}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              }
              
              {/* Opción de precio personalizado */}
              <label
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  borderColor: productDrawerData.price_id === 'custom' ? 'rgb(var(--color-primary-500))' : '#d1d5db',
                  backgroundColor: productDrawerData.price_id === 'custom' ? 'rgba(var(--color-primary-50), 0.5)' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="price"
                  value="custom"
                  checked={productDrawerData.price_id === 'custom'}
                  onChange={() => handlePriceChange('custom')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">{t('form.customPrice')}</span>
                </div>
              </label>
            </div>
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
            )}
          </div>
        )}

        {/* Campo de precio personalizado */}
        {selectedInventoryProduct && productDrawerData.price_id === 'custom' && (
          <Input
            type="number"
            id="custom_price"
            label={t('form.price')}
            value={productDrawerData.custom_price}
            onChange={(e) => handleCustomPriceChange(parseFloat(e.target.value) || 0)}
            placeholder={t('form.placeholders.price')}
            error={errors.price}
            step="0.01"
            min="0"
            required
          />
        )}
      </form>
    );
  }
);

AddProductForm.displayName = 'AddProductForm';

export default AddProductForm; 