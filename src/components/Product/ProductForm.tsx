'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
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
import { Tax, TaxType } from '@/types/tax';
import ImageCarousel from '@/components/ImageCarousel/ImageCarousel';
import Drawer from '@/components/Drawer/Drawer';
import BrandForm from '@/components/Brand/BrandForm';
import { BrandFormRef } from '@/components/Brand/BrandForm';
import CategoryForm from '@/components/Category/CategoryForm';
import { CategoryFormRef } from '@/components/Category/CategoryForm';
import MeasurementUnitForm from '@/components/Measurement/MeasurementUnitForm';
import { MeasurementUnitFormRef } from '@/components/Measurement/MeasurementUnitForm';
import TaxForm from '@/components/Tax/TaxForm';
import { TaxFormRef } from '@/components/Tax/TaxForm';
import { Input, TextArea } from '@/components/atoms';

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
  reset: () => void;
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

    const [images, setImages] = useState<(File | string)[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>([]);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    // Estados para el drawer de marcas
    const [showBrandDrawer, setShowBrandDrawer] = useState(false);
    const [isSavingBrand, setIsSavingBrand] = useState(false);
    const [isBrandFormValid, setIsBrandFormValid] = useState(false);
    const brandFormRef = useRef<BrandFormRef>(null);

    // Estados para el drawer de categorías
    const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isCategoryFormValid, setIsCategoryFormValid] = useState(false);
    const categoryFormRef = useRef<CategoryFormRef>(null);

    // Estados para el drawer de unidades de medida
    const [showMeasurementUnitDrawer, setShowMeasurementUnitDrawer] = useState(false);
    const [isSavingMeasurementUnit, setIsSavingMeasurementUnit] = useState(false);
    const [isMeasurementUnitFormValid, setIsMeasurementUnitFormValid] = useState(false);
    const measurementUnitFormRef = useRef<MeasurementUnitFormRef>(null);

    // Estados para el drawer de impuestos
    const [showTaxDrawer, setShowTaxDrawer] = useState(false);
    const [isSavingTax, setIsSavingTax] = useState(false);
    const [isTaxFormValid, setIsTaxFormValid] = useState(false);
    const taxFormRef = useRef<TaxFormRef>(null);

    const fetchBrands = async () => {
      try {
        const brandsData = await brandService.getBrands();
        setBrands(brandsData.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.getCategories();
        setCategories(categoriesData.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchMeasurementUnits = async () => {
      try {
        const measurementUnitsData = await measurementUnitsService.getMeasurementUnits();
        setMeasurementUnits(measurementUnitsData.data);
      } catch (error) {
        console.error('Error fetching measurement units:', error);
      }
    };

    const fetchTaxes = async () => {
      try {
        const taxesData = await taxesService.getTaxes();
        setTaxes(taxesData.data);
      } catch (error) {
        console.error('Error fetching taxes:', error);
      }
    };

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
        setImages(product.images || []);
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
          await productService.updateProduct(product.id, data, images as File[]);
        } else {
          await productService.createProduct(data, images as File[]);
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

    // Funciones para el drawer de marcas
    const handleBrandDrawerClose = () => {
      setShowBrandDrawer(false);
      setIsSavingBrand(false);
    };

    const handleBrandFormSuccess = () => {
      handleBrandDrawerClose();
      // Refrescar la lista de marcas
      fetchBrands();
      toastService.success('Marca creada correctamente');
    };

    const handleBrandSave = () => {
      brandFormRef.current?.submit();
    };

    // Funciones para el drawer de categorías
    const handleCategoryDrawerClose = () => {
      setShowCategoryDrawer(false);
      setIsSavingCategory(false);
    };

    const handleCategoryFormSuccess = () => {
      handleCategoryDrawerClose();
      // Refrescar la lista de categorías
      fetchCategories();
      toastService.success('Categoría creada correctamente');
    };

    const handleCategorySave = () => {
      categoryFormRef.current?.submit();
    };

    // Funciones para el drawer de unidades de medida
    const handleMeasurementUnitDrawerClose = () => {
      setShowMeasurementUnitDrawer(false);
      setIsSavingMeasurementUnit(false);
    };

    const handleMeasurementUnitFormSuccess = () => {
      handleMeasurementUnitDrawerClose();
      // Refrescar la lista de unidades de medida
      fetchMeasurementUnits();
      toastService.success('Unidad de medida creada correctamente');
    };

    const handleMeasurementUnitSave = () => {
      measurementUnitFormRef.current?.submit();
    };

    // Funciones para el drawer de impuestos
    const handleTaxDrawerClose = () => {
      setShowTaxDrawer(false);
      setIsSavingTax(false);
    };

    const handleTaxFormSuccess = () => {
      handleTaxDrawerClose();
      // Refrescar la lista de impuestos
      fetchTaxes();
      toastService.success('Impuesto creado correctamente');
    };

    const handleTaxSave = () => {
      taxFormRef.current?.save();
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit, 
      reset: () => {
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
        setImages([]);
      },
    }));

    // Estilos para los selects con focus dinámico
    const getInputStyles = () => ({
      appearance: 'none' as const,
      display: 'block',
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    });

    const handleInputFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = `rgb(var(--color-primary-500))`;
      e.target.style.boxShadow = `0 0 0 1px rgba(var(--color-primary-500), 0.1)`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    };

    return (
      <>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              id="name"
              label="Nombre"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: iPhone 15 Pro"
              error={errors.name}
            />

            <Input
              type="text"
              id="sku"
              label="SKU"
              required
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="Ej: IPH15PRO-256"
              error={errors.sku}
            />

            <div className="col-span-2">
              <div className="grid grid-cols-4 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  id="weight"
                  label="Peso (kg)"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  error={errors.weight}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="width"
                  label="Ancho (m)"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                  error={errors.width}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="height"
                  label="Alto (m)"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                  error={errors.height}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="length"
                  label="Largo (m)"
                  value={formData.length}
                  onChange={(e) => setFormData(prev => ({ ...prev, length: parseFloat(e.target.value) }))}
                  error={errors.length}
                />
              </div>
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label 
                    htmlFor="brand" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: `rgb(var(--color-primary-500))` }}
                  >
                    Marca <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="brand"
                      value={formData.brand_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        ...getInputStyles(),
                        paddingRight: '3rem', // Espacio para el botón
                      }}
                      required
                    >
                      <option value="">Seleccione una marca</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.code} - {brand.description}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowBrandDrawer(true)}
                      className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
                      style={{ 
                        backgroundColor: `rgb(var(--color-primary-500))`,
                        borderColor: `rgb(var(--color-primary-600))`,
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                      }}
                      title="Crear nueva marca"
                    >
                      +
                    </button>
                  </div>
                  {errors.brand_id && <p className="mt-1 text-xs text-gray-300">{errors.brand_id}</p>}
                </div>

                <div>
                  <label 
                    htmlFor="category" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: `rgb(var(--color-primary-500))` }}
                  >
                    Categoría <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        ...getInputStyles(),
                        paddingRight: '3rem', // Espacio para el botón
                      }}
                      required
                    >
                      <option value="">Seleccione una categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryDrawer(true)}
                      className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
                      style={{ 
                        backgroundColor: `rgb(var(--color-primary-500))`,
                        borderColor: `rgb(var(--color-primary-600))`,
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                      }}
                      title="Crear nueva categoría"
                    >
                      +
                    </button>
                  </div>
                  {errors.category_id && <p className="mt-1 text-xs text-gray-300">{errors.category_id}</p>}
                </div>

                <div>
                  <label 
                    htmlFor="measurement_unit" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: `rgb(var(--color-primary-500))` }}
                  >
                    Unidad de Medida <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="measurement_unit"
                      value={formData.measurement_unit_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, measurement_unit_id: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        ...getInputStyles(),
                        paddingRight: '3rem', // Espacio para el botón
                      }}
                      required
                    >
                      <option value="">Seleccione una unidad</option>
                      {measurementUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.code} - {unit.description}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowMeasurementUnitDrawer(true)}
                      className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
                      style={{ 
                        backgroundColor: `rgb(var(--color-primary-500))`,
                        borderColor: `rgb(var(--color-primary-600))`,
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                      }}
                      title="Crear nueva unidad de medida"
                    >
                      +
                    </button>
                  </div>
                  {errors.measurement_unit_id && (
                    <p className="mt-1 text-xs text-gray-300">{errors.measurement_unit_id}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="tax" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: `rgb(var(--color-primary-500))` }}
                  >
                    Impuesto <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="tax"
                      value={formData.tax_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      style={{
                        ...getInputStyles(),
                        paddingRight: '3rem', // Espacio para el botón
                      }}
                      required
                    >
                      <option value="">Seleccione un impuesto</option>
                      {taxes.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name} ({tax.value}{tax.type === TaxType.PERCENTAGE ? '%' : ' fijo'})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowTaxDrawer(true)}
                      className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
                      style={{ 
                        backgroundColor: `rgb(var(--color-primary-500))`,
                        borderColor: `rgb(var(--color-primary-600))`,
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                      }}
                      title="Crear nuevo impuesto"
                    >
                      +
                    </button>
                  </div>
                  {errors.tax_id && <p className="mt-1 text-xs text-gray-300">{errors.tax_id}</p>}
                </div>

                <div>
                  <label 
                    htmlFor="type" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: `rgb(var(--color-primary-500))` }}
                  >
                    Tipo de Producto <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProductType }))}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={getInputStyles()}
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

          <TextArea
            id="description"
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del producto"
            rows={2}
            error={errors.description}
          />

          <ImageCarousel
            images={images as File[]}
            onImagesChange={setImages}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 border-gray-300 rounded"
              style={{
                accentColor: `rgb(var(--color-primary-500))`,
              }}
            />
            <label 
              htmlFor="isActive" 
              className="ml-2 block text-sm"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              Activo
            </label>
          </div>
        </form>

        {/* Drawer para crear marcas */}
        <Drawer
          isOpen={showBrandDrawer}
          onClose={handleBrandDrawerClose}
          title="Nueva Marca"
          onSave={handleBrandSave}
          isSaving={isSavingBrand}
          isFormValid={isBrandFormValid}
        >
          <BrandForm
            ref={brandFormRef}
            brand={null}
            onClose={handleBrandDrawerClose}
            onSuccess={handleBrandFormSuccess}
            onSavingChange={setIsSavingBrand}
            onValidChange={setIsBrandFormValid}
          />
        </Drawer>

        {/* Drawer para crear categorías */}
        <Drawer
          isOpen={showCategoryDrawer}
          onClose={handleCategoryDrawerClose}
          title="Nueva Categoría"
          onSave={handleCategorySave}
          isSaving={isSavingCategory}
          isFormValid={isCategoryFormValid}
        >
          <CategoryForm
            ref={categoryFormRef}
            category={null}
            onClose={handleCategoryDrawerClose}
            onSuccess={handleCategoryFormSuccess}
            onSavingChange={setIsSavingCategory}
            onValidChange={setIsCategoryFormValid}
          />
        </Drawer>

        {/* Drawer para crear unidades de medida */}
        <Drawer
          isOpen={showMeasurementUnitDrawer}
          onClose={handleMeasurementUnitDrawerClose}
          title="Nueva Unidad de Medida"
          onSave={handleMeasurementUnitSave}
          isSaving={isSavingMeasurementUnit}
          isFormValid={isMeasurementUnitFormValid}
        >
          <MeasurementUnitForm
            ref={measurementUnitFormRef}
            unit={null}
            onClose={handleMeasurementUnitDrawerClose}
            onSuccess={handleMeasurementUnitFormSuccess}
            onSavingChange={setIsSavingMeasurementUnit}
            onValidChange={setIsMeasurementUnitFormValid}
          />
        </Drawer>

        {/* Drawer para crear impuestos */}
        <Drawer
          isOpen={showTaxDrawer}
          onClose={handleTaxDrawerClose}
          title="Nuevo Impuesto"
          onSave={handleTaxSave}
          isSaving={isSavingTax}
          isFormValid={isTaxFormValid}
        >
          <TaxForm
            ref={taxFormRef}
            initialData={null}
            onClose={handleTaxDrawerClose}
            onSuccess={handleTaxFormSuccess}
            onSavingChange={setIsSavingTax}
            onValidChange={setIsTaxFormValid}
          />
        </Drawer>
      </>
    );
  }
);

ProductForm.displayName = 'ProductForm';

export default ProductForm; 