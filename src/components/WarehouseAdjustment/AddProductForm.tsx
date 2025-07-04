'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { productsService } from '@/services';
import { Product } from '@/types/product';
import { Btn, Input, Select } from '@/components/atoms';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; quantity: number; price: number }) => void;
  loading: boolean;
}

export function AddProductForm({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: AddProductFormProps) {
  const t = useTranslations('pages.warehouseAdjustments');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    price: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const response = await productsService.getProducts({});
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = t('addProduct.validation.productRequired');
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t('addProduct.validation.quantityRequired');
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = t('addProduct.validation.priceRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} (${product.sku})`,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('addProduct.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addProduct.form.product')} *
              </label>
              <Select
                value={formData.productId}
                onChange={(value) => handleInputChange('productId', value)}
                options={productOptions}
                placeholder={t('addProduct.form.placeholders.product')}
                error={errors.productId}
              />
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addProduct.form.quantity')} *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                error={errors.quantity}
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addProduct.form.price')} *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                error={errors.price}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <Btn
                type="button"
                onClick={onClose}
                variant="outline"
                size="md"
              >
                {t('actions.cancel')}
              </Btn>
              <Btn
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="md"
              >
                {t('actions.add')}
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 