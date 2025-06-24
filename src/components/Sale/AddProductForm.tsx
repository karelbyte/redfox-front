'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { productService } from '@/services/products.service';
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

    // Función para buscar productos
    const searchProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await productService.getProducts(1, term, true,'tangible');
        return (response.data || []).map(product => ({
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
          onChange={(productId) => setFormData(prev => ({ ...prev, product_id: productId }))}
          onSearch={searchProducts}
          label={t('form.product')}
          placeholder={t('form.selectProduct')}
          required
          error={errors.product_id}
          disabled={!!saleDetail}
        />

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