'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { productService } from '@/services/products.service';
import { toastService } from '@/services/toast.service';
import { Product, ProductFormData } from '@/types/product';
import { Brand } from '@/types/brand';
import { Category } from '@/types/category';
import { MeasurementUnit } from '@/types/measurement-unit';
import { brandService } from '@/services/brand.service';
import { categoriesService } from '@/services/categories.service';
import { measurementUnitsService } from '@/services/measurement-units.service';
import { taxesService } from '@/services/taxes.service';
import { Tax } from '@/types/tax';
import ImageCarousel from '@/components/ImageCarousel/ImageCarousel';

export enum ProductType {
  DIGITAL = 'digital',
  SERVICE = 'service',
  TANGIBLE = 'tangible',
}

export interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface ProductFormRef {
  submit: () => void;
}

interface FormErrors {
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  weight?: string;
  width?: string;
  height?: string;
  length?: string;
  measurement_unit_id?: string;
  category_id?: string;
  brand_id?: string;
  tax_id?: string;
  type?: string;
}

const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  ({ product, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<ProductFormData>({
      name: '',
      slug: '',
      description: '',
      sku: '',
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      measurement_unit_id: '',
      category_id: '',
      brand_id: '',
      tax_id: '',
      is_active: true,
      type: ProductType.TANGIBLE,
    });

    const [images, setImages] = useState<File[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>([]);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [brandsData, categoriesData, measurementUnitsData, taxesData] = await Promise.all([
            brandService.getBrands(),
            categoriesService.getCategories(),
            measurementUnitsService.getMeasurementUnits(),
            taxesService.getTaxes(),
          ]);

          setBrands(brandsData.data);
          setCategories(categoriesData.data);
          setMeasurementUnits(measurementUnitsData.data);
          setTaxes(taxesData.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug || '',
          description: product.description || '',
          sku: product.sku,
          weight: Number(product.weight) || 0,
          width: Number(product.width) || 0,
          height: Number(product.height) || 0,
          length: Number(product.length) || 0,
          measurement_unit_id: typeof product.measurement_unit === 'object' ? product.measurement_unit.id : product.measurement_unit,
          category_id: typeof product.category === 'object' ? product.category.id : product.category,
          brand_id: typeof product.brand === 'object' ? product.brand.id : product.brand,
          tax_id: typeof product.tax === 'object' ? product.tax.id : product.tax,
          is_active: product.is_active,
          type: product.type || ProductType.TANGIBLE,
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
          sku: '',
          weight: 0,
          width: 0,
          height: 0,
          length: 0,
          measurement_unit_id: '',
          category_id: '',
          brand_id: '',
          tax_id: '',
          is_active: true,
          type: ProductType.TANGIBLE,
        });
      }
    }, [product]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
        isValid = false;
      }

      if (!formData.sku.trim()) {
        newErrors.sku = 'El SKU es requerido';
        isValid = false;
      }

      if (!formData.brand_id) {
        newErrors.brand_id = 'La marca es requerida';
        isValid = false;
      }

      if (!formData.category_id) {
        newErrors.category_id = 'La categoría es requerida';
        isValid = false;
      }

      if (!formData.measurement_unit_id) {
        newErrors.measurement_unit_id = 'La unidad de medida es requerida';
        isValid = false;
      }

      if (!formData.tax_id) {
        newErrors.tax_id = 'El impuesto es requerido';
        isValid = false;
      }

      if (!formData.type) {
        newErrors.type = 'El tipo de producto es requerido';
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    }, [formData]);

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        const data = {
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          sku: formData.sku.trim(),
          slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
        };

        if (product) {
          await productService.updateProduct(product.id, data, images);
        } else {
          await productService.createProduct(data, images);
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar el producto');
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-red-400 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              placeholder="Ej: iPhone 15 Pro"
              required
            />
            {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-red-400 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              placeholder="Ej: IPH15PRO-256"
              required
            />
            {errors.sku && <p className="mt-1 text-xs text-gray-300">{errors.sku}</p>}
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-red-400 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="width" className="block text-sm font-medium text-red-400 mb-2">
                  Ancho (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="width"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-red-400 mb-2">
                  Alto (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="length" className="block text-sm font-medium text-red-400 mb-2">
                  Largo (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="length"
                  value={formData.length}
                  onChange={(e) => setFormData(prev => ({ ...prev, length: parseFloat(e.target.value) }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-red-400 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <select
                  id="brand"
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                  required
                >
                  <option value="">Seleccione una marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.code} - {brand.description}
                    </option>
                  ))}
                </select>
                {errors.brand_id && <p className="mt-1 text-xs text-gray-300">{errors.brand_id}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-red-400 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-xs text-gray-300">{errors.category_id}</p>}
              </div>

              <div>
                <label htmlFor="measurement_unit" className="block text-sm font-medium text-red-400 mb-2">
                  Unidad de Medida <span className="text-red-500">*</span>
                </label>
                <select
                  id="measurement_unit"
                  value={formData.measurement_unit_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, measurement_unit_id: e.target.value }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                  required
                >
                  <option value="">Seleccione una unidad</option>
                  {measurementUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.code} - {unit.description}
                    </option>
                  ))}
                </select>
                {errors.measurement_unit_id && (
                  <p className="mt-1 text-xs text-gray-300">{errors.measurement_unit_id}</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tax" className="block text-sm font-medium text-red-400 mb-2">
                  Impuesto <span className="text-red-500">*</span>
                </label>
                <select
                  id="tax"
                  value={formData.tax_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                  required
                >
                  <option value="">Seleccione un impuesto</option>
                  {taxes.map((tax) => (
                    <option key={tax.id} value={tax.id}>
                      {tax.name} ({tax.percentage}%)
                    </option>
                  ))}
                </select>
                {errors.tax_id && <p className="mt-1 text-xs text-gray-300">{errors.tax_id}</p>}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-red-400 mb-2">
                  Tipo de Producto <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProductType }))}
                  className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
                  required
                >
                  <option value={ProductType.TANGIBLE}>Tangible</option>
                  <option value={ProductType.DIGITAL}>Digital</option>
                  <option value={ProductType.SERVICE}>Servicio</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-gray-300">{errors.type}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-400 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Descripción del producto"
            rows={2}
          />
        </div>

        <ImageCarousel
          images={images}
          onChange={setImages}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-red-400">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

ProductForm.displayName = 'ProductForm';

export default ProductForm; 