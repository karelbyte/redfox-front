'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { PurchaseOrderDetail, PurchaseOrderDetailFormData } from '@/types/purchase-order';
import { productsService } from '@/services';
import { warehousesService } from '@/services/warehouses.service';
import { Input, SearchSelect, Select } from '@/components/atoms';
import { Warehouse } from '@/types/warehouse';

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
      price: 0,
      warehouse_id: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
      warehousesService.getWarehouses({ isClosed: true })
        .then(r => setWarehouses(r.data || []))
        .catch(() => {});
    }, []);

    useEffect(() => {
      if (purchaseOrderDetail) {
        setFormData({
          product_id: purchaseOrderDetail.product.id,
          quantity: purchaseOrderDetail.quantity,
          price: purchaseOrderDetail.price,
          warehouse_id: purchaseOrderDetail.warehouse?.id || '',
        });
      }
    }, [purchaseOrderDetail]);

    const searchProducts = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await productsService.getProducts(undefined, term);
        return (response.data || []).map(p => ({
          id: p.id,
          label: p.name,
          subtitle: `SKU: ${p.sku}`,
        }));
      } catch {
        return [];
      }
    };

    const handleProductSelect = async (id: string) => {
      setFormData(prev => ({ ...prev, product_id: id }));
      if (!id) return;
      try {
        const product = await productsService.getProductById(id);
        setFormData(prev => ({ ...prev, product_id: id, price: product.base_price ?? 0 }));
      } catch {
        // si falla el fetch, dejamos el precio como estaba
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      if (!formData.product_id) newErrors.product_id = t('addProduct.form.validation.productRequired');
      const qty = typeof formData.quantity === 'string' ? parseFloat(formData.quantity) : formData.quantity;
      const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
      if (!formData.quantity || qty <= 0) newErrors.quantity = qty <= 0 ? t('addProduct.form.validation.quantityPositive') : t('addProduct.form.validation.quantityRequired');
      if (!formData.price || price <= 0) newErrors.price = price <= 0 ? t('addProduct.form.validation.pricePositive') : t('addProduct.form.validation.priceRequired');
      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => { validateForm(); }, [formData]); // eslint-disable-line

    const handleSubmit = async (): Promise<PurchaseOrderDetailFormData | null> => {
      if (!validateForm()) return null;
      try {
        onSavingChange?.(true);
        return {
          ...formData,
          quantity: typeof formData.quantity === 'string' ? parseFloat(formData.quantity) : formData.quantity,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
          warehouse_id: formData.warehouse_id || undefined,
        };
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({ submit: handleSubmit, getFormData: () => formData }));

    return (
      <form className="space-y-6">
        <SearchSelect
          value={formData.product_id as string}
          onChange={handleProductSelect}
          onSearch={searchProducts}
          label={t('addProduct.form.product')}
          placeholder={t('addProduct.form.selectProduct')}
          required
          error={errors.product_id}
          disabled={!!purchaseOrderDetail}
        />

        <div className="grid grid-cols-2 gap-4">
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

        {/* Almacén destino — opcional */}
        <Select
          id="warehouse"
          label={t('addProduct.form.warehouseDestination')}
          value={formData.warehouse_id as string}
          onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
          options={warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))}
          placeholder={t('addProduct.form.warehouseDestinationPlaceholder')}
        />
      </form>
    );
  }
);

AddProductForm.displayName = 'AddProductForm';
export default AddProductForm;
