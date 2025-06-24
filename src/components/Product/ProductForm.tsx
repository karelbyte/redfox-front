"use client";

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import { useTranslations } from 'next-intl';
import { productService } from "@/services/products.service";
import { toastService } from "@/services/toast.service";
import { Product, ProductFormData } from "@/types/product";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import { MeasurementUnit } from "@/types/measurement-unit";
import { brandService } from "@/services/brand.service";
import { categoriesService } from "@/services/categories.service";
import { measurementUnitsService } from "@/services/measurement-units.service";
import { taxesService } from "@/services/taxes.service";
import { Tax } from "@/types/tax";
import ImageCarousel from "@/components/ImageCarousel/ImageCarousel";
import Drawer from "@/components/Drawer/Drawer";
import BrandForm from "@/components/Brand/BrandForm";
import { BrandFormRef } from "@/components/Brand/BrandForm";
import CategoryForm from "@/components/Category/CategoryForm";
import { CategoryFormRef } from "@/components/Category/CategoryForm";
import MeasurementUnitForm from "@/components/Measurement/MeasurementUnitForm";
import { MeasurementUnitFormRef } from "@/components/Measurement/MeasurementUnitForm";
import TaxForm from "@/components/Tax/TaxForm";
import { TaxFormRef } from "@/components/Tax/TaxForm";
import {
  Input,
  TextArea,
  Select,
  Checkbox,
  SelectWithAddScrolled,
} from "@/components/atoms";

export enum ProductType {
  DIGITAL = "digital",
  SERVICE = "service",
  TANGIBLE = "tangible",
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
    const t = useTranslations('pages.products');
    
    const [formData, setFormData] = useState<ProductFormData>({
      name: "",
      slug: "",
      description: "",
      sku: "",
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      measurement_unit_id: "",
      category_id: "",
      brand_id: "",
      tax_id: "",
      is_active: true,
      type: ProductType.TANGIBLE,
    });

    const [images, setImages] = useState<(File | string)[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>(
      []
    );
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
    const [showMeasurementUnitDrawer, setShowMeasurementUnitDrawer] =
      useState(false);
    const [isSavingMeasurementUnit, setIsSavingMeasurementUnit] =
      useState(false);
    const [isMeasurementUnitFormValid, setIsMeasurementUnitFormValid] =
      useState(false);
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
        console.error("Error fetching brands:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.getCategories();
        setCategories(categoriesData.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchMeasurementUnits = async () => {
      try {
        const measurementUnitsData =
          await measurementUnitsService.getMeasurementUnits();
        setMeasurementUnits(measurementUnitsData.data);
      } catch (error) {
        console.error("Error fetching measurement units:", error);
      }
    };

    const fetchTaxes = async () => {
      try {
        const taxesData = await taxesService.getTaxes();
        setTaxes(taxesData.data);
      } catch (error) {
        console.error("Error fetching taxes:", error);
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [brandsData, categoriesData, measurementUnitsData, taxesData] =
            await Promise.all([
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
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug || "",
          description: product.description || "",
          sku: product.sku,
          weight: Number(product.weight) || 0,
          width: Number(product.width) || 0,
          height: Number(product.height) || 0,
          length: Number(product.length) || 0,
          measurement_unit_id:
            typeof product.measurement_unit === "object"
              ? product.measurement_unit.id
              : product.measurement_unit,
          category_id:
            typeof product.category === "object"
              ? product.category.id
              : product.category,
          brand_id:
            typeof product.brand === "object"
              ? product.brand.id
              : product.brand,
          tax_id:
            typeof product.tax === "object" ? product.tax.id : product.tax,
          is_active: product.is_active,
          type: product.type || ProductType.TANGIBLE,
        });
        setImages(product.images || []);
      } else {
        setFormData({
          name: "",
          slug: "",
          description: "",
          sku: "",
          weight: 0,
          width: 0,
          height: 0,
          length: 0,
          measurement_unit_id: "",
          category_id: "",
          brand_id: "",
          tax_id: "",
          is_active: true,
          type: ProductType.TANGIBLE,
        });
      }
    }, [product]);

    const validateForm = useCallback(() => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.name.trim()) {
        newErrors.name = t('form.errors.nameRequired');
        isValid = false;
      }

      if (!formData.sku.trim()) {
        newErrors.sku = t('form.errors.skuRequired');
        isValid = false;
      }

      if (!formData.brand_id) {
        newErrors.brand_id = t('form.errors.brandRequired');
        isValid = false;
      }

      if (!formData.category_id) {
        newErrors.category_id = t('form.errors.categoryRequired');
        isValid = false;
      }

      if (!formData.measurement_unit_id) {
        newErrors.measurement_unit_id = t('form.errors.measurementUnitRequired');
        isValid = false;
      }

      if (!formData.tax_id) {
        newErrors.tax_id = t('form.errors.taxRequired');
        isValid = false;
      }

      if (!formData.type) {
        newErrors.type = t('form.errors.typeRequired');
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    }, [formData, onValidChange, t]);

    useEffect(() => {
      validateForm();
    }, [validateForm]);

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
          slug:
            formData.slug.trim() ||
            formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
        };

        if (product) {
          await productService.updateProduct(
            product.id,
            data,
            images as File[]
          );
          toastService.success(t('messages.productUpdated'));
        } else {
          await productService.createProduct(data, images as File[]);
          toastService.success(t('messages.productCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            product
              ? t('messages.errorUpdating')
              : t('messages.errorCreating')
          );
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
      toastService.success("Marca creada correctamente");
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
      toastService.success("Categoría creada correctamente");
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
      toastService.success("Unidad de medida creada correctamente");
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
      toastService.success("Impuesto creado correctamente");
    };

    const handleTaxSave = () => {
      taxFormRef.current?.save();
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      reset: () => {
        setFormData({
          name: "",
          slug: "",
          description: "",
          sku: "",
          weight: 0,
          width: 0,
          height: 0,
          length: 0,
          measurement_unit_id: "",
          category_id: "",
          brand_id: "",
          tax_id: "",
          is_active: true,
          type: ProductType.TANGIBLE,
        });
        setImages([]);
      },
    }));

    const productTypeOptions = [
      { value: ProductType.TANGIBLE, label: t('form.types.tangible') },
      { value: ProductType.DIGITAL, label: t('form.types.digital') },
      { value: ProductType.SERVICE, label: t('form.types.service') },
    ];

    return (
      <>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              id="name"
              label={t('form.name')}
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t('form.placeholders.name')}
              error={errors.name}
            />

            <Input
              type="text"
              id="sku"
              label={t('form.sku')}
              required
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              placeholder={t('form.placeholders.sku')}
              error={errors.sku}
            />

            <div className="col-span-2">
              <div className="grid grid-cols-4 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  id="weight"
                  label={t('form.weight')}
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: parseFloat(e.target.value),
                    }))
                  }
                  error={errors.weight}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="width"
                  label={t('form.width')}
                  value={formData.width}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      width: parseFloat(e.target.value),
                    }))
                  }
                  error={errors.width}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="height"
                  label={t('form.height')}
                  value={formData.height}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      height: parseFloat(e.target.value),
                    }))
                  }
                  error={errors.height}
                />

                <Input
                  type="number"
                  step="0.01"
                  id="length"
                  label={t('form.length')}
                  value={formData.length}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      length: parseFloat(e.target.value),
                    }))
                  }
                  error={errors.length}
                />
              </div>
            </div>

            <TextArea
              id="description"
              label={t('form.description')}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              placeholder={t('form.placeholders.description')}
              error={errors.description}
            />

            <Select
              id="type"
              label={t('form.type')}
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value as ProductType }))
              }
              options={productTypeOptions}
              error={errors.type}
            />

            <SelectWithAddScrolled
              id="brand_id"
              label={t('form.brand')}
              value={formData.brand_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand_id: e.target.value }))
              }
              options={brands.map((brand) => ({
                value: brand.id.toString(),
                label: brand.description,
              }))}
              showAddButton={true}
              onAddClick={() => setShowBrandDrawer(true)}
              error={errors.brand_id}
            />

            <SelectWithAddScrolled
              id="category_id"
              label={t('form.category')}
              value={formData.category_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category_id: e.target.value }))
              }
              options={categories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
              }))}
              showAddButton={true}
              onAddClick={() => setShowCategoryDrawer(true)}
              error={errors.category_id}
            />

            <SelectWithAddScrolled
              id="measurement_unit_id"
              label={t('form.measurementUnit')}
              value={formData.measurement_unit_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  measurement_unit_id: e.target.value,
                }))
              }
              options={measurementUnits.map((unit) => ({
                value: unit.id.toString(),
                label: unit.description,
              }))}
              showAddButton={true}
              onAddClick={() => setShowMeasurementUnitDrawer(true)}
              error={errors.measurement_unit_id}
            />

            <SelectWithAddScrolled
              id="tax_id"
              label={t('form.tax')}
              value={formData.tax_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tax_id: e.target.value }))
              }
              options={taxes.map((tax) => ({
                value: tax.id.toString(),
                label: `${tax.name} (${tax.value}%)`,
              }))}
              showAddButton={true}
              onAddClick={() => setShowTaxDrawer(true)}
              error={errors.tax_id}
            />

            <Checkbox
              id="is_active"
              label={t('form.active')}
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.images')}
            </label>
            <ImageCarousel
              images={images}
              onChange={setImages}
            />
          </div>
        </form>

        {/* Drawer para crear marcas */}
        <Drawer
          id="brand-drawer"
          parentId="product-drawer"
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
          id="category-drawer"
          parentId="product-drawer"
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
          id="measurement-unit-drawer"
          parentId="product-drawer"
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
          id="tax-drawer"
          parentId="product-drawer"
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

ProductForm.displayName = "ProductForm";

export default ProductForm;
