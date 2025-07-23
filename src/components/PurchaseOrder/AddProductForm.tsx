'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { PurchaseOrderDetail, PurchaseOrderDetailFormData } from '@/types/purchase-order';
import { productsService } from '@/services';
import { Input, SearchSelect } from '@/components/atoms';

export interface AddProductFormProps {
  purchaseOrderDetail?: PurchaseOrderDetail | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface AddProductFormRef {
  submit: () => Promise<PurchaseOrderDetailFormData | null>;
  getFormData: () => PurchaseOrderDetailFormData;
}

interface FormErrors {
  product_id?: string;
  quantity?: string;
  price?: string;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ purchaseOrderDetail, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.purchaseOrders');
    const [formData, setFormData] = useState<PurchaseOrderDetailFormData>({
      product_id: '',
      quantity: 0,
      price: 0
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Cargar datos del producto a editar
    useEffect(() => {
      if (purchaseOrderDetail) {
        setFormData({
          product_id: purchaseOrderDetail.product.id,
          quantity: purchaseOrderDetail.quantity,
          price: purchaseOrderDetail.price
        });
      }
    }, [purchaseOrderDetail]);

    // Función para buscar productos
    const searchProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await productsService.getProducts(undefined, term);
        const products = response.data || [];
        return products
          .filter(product => 
            product.name.toLowerCase().includes(term.toLowerCase()) ||
            product.sku.toLowerCase().includes(term.toLowerCase())
          )
          .map(product => ({
            id: product.id,
            label: product.name,
            subtitle: `SKU: ${product.sku}`
          }));
      } catch (error) {
        console.error('Error buscando productos:', error);
        return [];
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.product_id) {
        newErrors.product_id = t('addProduct.form.validation.productRequired');
      }

      const quantity = typeof formData.quantity === 'string' ? parseFloat(formData.quantity) : formData.quantity;
      const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;

      if (!formData.quantity || quantity <= 0) {
        newErrors.quantity = quantity <= 0 ? t('addProduct.form.validation.quantityPositive') : t('addProduct.form.validation.quantityRequired');
      }

      if (!formData.price || price <= 0) {
        newErrors.price = price <= 0 ? t('addProduct.form.validation.pricePositive') : t('addProduct.form.validation.priceRequired');
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

    const handleSubmit = async (): Promise<PurchaseOrderDetailFormData | null> => {
      if (!validateForm()) {
        return null;
      }

      try {
        onSavingChange?.(true);
        return {
          ...formData,
          quantity: typeof formData.quantity === 'string' ? parseFloat(formData.quantity) : formData.quantity,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error en el formulario:', error.message);
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
        {/* Producto */}
        <div>
          <SearchSelect
            value={formData.product_id}
            onChange={(productId) => setFormData(prev => ({ ...prev, product_id: productId }))}
            onSearch={searchProducts}
            label={t('addProduct.form.product')}
            placeholder={t('addProduct.form.selectProduct')}
            required
            error={errors.product_id}
          />
        </div>

        {/* Cantidad */}
        <div>
          <Input
            type="number"
            label={t('addProduct.form.quantity')}
            placeholder={t('addProduct.form.placeholders.quantity')}
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
            error={errors.quantity}
            required
            min="0"
            step="1"
          />
        </div>

        {/* Precio */}
        <div>
          <Input
            type="number"
            label={t('addProduct.form.price')}
            placeholder={t('addProduct.form.placeholders.price')}
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            error={errors.price}
            required
            min="0"
            step="0.01"
          />
        </div>
      </form>
    );
  }
);

AddProductForm.displayName = 'AddProductForm';

export default AddProductForm; 