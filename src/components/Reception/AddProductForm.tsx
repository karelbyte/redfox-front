'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { ReceptionDetail, ReceptionDetailFormData } from '@/types/reception';
import { Input, SearchSelect } from '@/components/atoms';
import { Product } from '@/types/product';

export interface AddProductFormProps {
  receptionDetail?: ReceptionDetail | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface AddProductFormRef {
  submit: () => Promise<ReceptionDetailFormData | null>;
  getFormData: () => ReceptionDetailFormData;
}

interface FormErrors {
  product_id?: string;
  quantity?: string;
  price?: string;
  expiration_date?: string;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ receptionDetail, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.receptions.addProduct');
    const [formData, setFormData] = useState<ReceptionDetailFormData>({
      product_id: '',
      quantity: 0,
      price: 0,
      batch_number: '',
      expiration_date: '',
    });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Estrategia del producto seleccionado
    const strategy = selectedProduct?.inventory_strategy || 'average';
    const isFEFO = strategy === 'fefo';
    const isFIFO = strategy === 'fifo';
    const isAVERAGE = strategy === 'average';

    useEffect(() => {
      if (receptionDetail) {
        setFormData({
          product_id: receptionDetail.product.id,
          quantity: receptionDetail.quantity,
          price: receptionDetail.price,
          batch_number: receptionDetail.batch_number || '',
          expiration_date: receptionDetail.expiration_date
            ? new Date(receptionDetail.expiration_date).toISOString().split('T')[0]
            : '',
        });
        // Reconstruir el producto desde el detalle para tener la estrategia
        if (receptionDetail.product) {
          setSelectedProduct(receptionDetail.product as unknown as Product);
        }
      }
    }, [receptionDetail]);

    const searchProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string; data?: Product }[]> => {
      try {
        const response = await productService.getProducts(1, term, true, 'tangible');
        return (response.data || []).map(product => ({
          id: product.id,
          label: product.name,
          subtitle: `SKU: ${product.sku} · ${strategyLabel(product.inventory_strategy)}`,
          data: product,
        }));
      } catch (error) {
        console.error('Error searching products:', error);
        return [];
      }
    };

    const strategyLabel = (s?: string) => {
      if (s === 'fifo') return 'FIFO';
      if (s === 'fefo') return 'FEFO';
      return 'Promedio';
    };

    const handleProductSelect = async (productId: string) => {
      setFormData(prev => ({ ...prev, product_id: productId, batch_number: '', expiration_date: '' }));
      try {
        const product = await productService.getProductById(productId);
        if (product) {
          setSelectedProduct(product);
          // Pre-llenar el precio base del producto (editable)
          if (product.base_price) {
            setFormData(prev => ({ ...prev, price: product.base_price }));
          }
        }
      } catch {
        // no bloquear el flujo
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.product_id) {
        newErrors.product_id = t('form.errors.productRequired');
      }

      const quantity = typeof formData.quantity === 'string' ? parseFloat(formData.quantity) : formData.quantity;
      const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;

      if (!formData.quantity || quantity <= 0) {
        newErrors.quantity = quantity <= 0
          ? t('form.errors.quantityPositive')
          : t('form.errors.quantityRequired');
      }

      if (!formData.price || price <= 0) {
        newErrors.price = price <= 0
          ? t('form.errors.pricePositive')
          : t('form.errors.priceRequired');
      }

      // FEFO requiere fecha de vencimiento
      if (isFEFO && !formData.expiration_date) {
        newErrors.expiration_date = t('form.errors.expirationDateRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, strategy]);

    const handleSubmit = async (): Promise<ReceptionDetailFormData | null> => {
      if (!validateForm()) return null;

      try {
        onSavingChange?.(true);
        const data: ReceptionDetailFormData = {
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          // AVERAGE: limpiar lote y fecha
          batch_number: isAVERAGE ? '' : formData.batch_number,
          expiration_date: isAVERAGE ? '' : formData.expiration_date,
        };
        return data;
      } catch (error) {
        toastService.error(error instanceof Error ? error.message : t('messages.errorAdding'));
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
          onChange={(productId) => handleProductSelect(productId)}
          onSearch={searchProducts}
          label={t('form.product')}
          placeholder={t('form.selectProduct')}
          required
          error={errors.product_id}
          disabled={!!receptionDetail}
        />

        {/* Indicador de estrategia */}
        {selectedProduct && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
            isFEFO ? 'bg-orange-50 text-orange-700 border border-orange-200' :
            isFIFO ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            <span>
              {isFEFO && '📅 FEFO — '}
              {isFIFO && '📦 FIFO — '}
              {isAVERAGE && '⚖️ Precio Promedio — '}
            </span>
            <span className="font-normal">
              {isFEFO && t('form.strategyHints.fefo')}
              {isFIFO && t('form.strategyHints.fifo')}
              {isAVERAGE && t('form.strategyHints.average')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            helperText={selectedProduct?.base_price ? t('form.priceHint', { price: selectedProduct.base_price }) : undefined}
          />
        </div>

        {/* Lote y fecha — solo para FIFO y FEFO */}
        {!isAVERAGE && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              id="batch_number"
              label={`${t('form.batchNumber')}${isFIFO ? ` (${t('form.recommended')})` : ''}`}
              value={formData.batch_number}
              onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
              placeholder={t('form.placeholders.batchNumber')}
            />

            <Input
              type="date"
              id="expiration_date"
              label={`${t('form.expirationDate')}${isFEFO ? ' *' : ` (${t('form.optional')})`}`}
              value={formData.expiration_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              error={errors.expiration_date}
              required={isFEFO}
            />
          </div>
        )}
      </form>
    );
  }
);

AddProductForm.displayName = 'AddProductForm';

export default AddProductForm;
