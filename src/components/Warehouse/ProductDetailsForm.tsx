"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useTranslations } from 'next-intl';
import { WarehouseOpening } from "@/types/warehouse-opening";
import { Warehouse } from "@/types/warehouse";

export interface ProductDetailsFormProps {
  opening: WarehouseOpening | null;
  warehouse?: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface ProductDetailsFormRef {
  submit: () => void;
}

const ProductDetailsForm = forwardRef<
  ProductDetailsFormRef,
  ProductDetailsFormProps
>(({ opening, warehouse, onSuccess }, ref) => {
  const t = useTranslations('pages.warehouseOpenings');
  
  const handleSubmit = async () => {
    // No hay envío en vista de detalles, solo cerramos
    onSuccess();
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  if (!opening) {
    return <div>{t('productDetails.noData')}</div>;
  }

  const { product } = opening;

  const formatPrice = (price: number) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return "0.00";
    }

    if (!warehouse?.currency) {
      return numPrice.toFixed(2);
    }

    return `${warehouse.currency.code} ${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {t('productDetails.name')}
          </label>
          <div
            className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
            style={{ borderColor: `rgb(var(--color-primary-300))` }}
          >
            {product.name}
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {t('productDetails.sku')}
          </label>
          <div
            className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
            style={{ borderColor: `rgb(var(--color-primary-300))` }}
          >
            {product.sku}
          </div>
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.weight')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {product.weight}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.width')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {product.width}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.height')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {product.height}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.length')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {product.length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.brand')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {typeof product.brand === "object"
                  ? product.brand.description
                  : product.brand}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.category')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.measurementUnit')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {typeof product.measurement_unit === "object"
                  ? `${product.measurement_unit.description} (${product.measurement_unit.code})`
                  : product.measurement_unit}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.tax')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {typeof product.tax === "object"
                  ? `${product.tax.name} (${product.tax.type})`
                  : product.tax}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: `rgb(var(--color-primary-500))` }}
              >
                {t('productDetails.productType')}
              </label>
              <div
                className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border capitalize"
                style={{ borderColor: `rgb(var(--color-primary-300))` }}
              >
                {product.type}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: `rgb(var(--color-primary-500))` }}
        >
          {t('productDetails.description')}
        </label>
        <div
          className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border min-h-[60px]"
          style={{ borderColor: `rgb(var(--color-primary-300))` }}
        >
          {product.description}
        </div>
      </div>

      {/* Información de la apertura */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          {t('productDetails.openingInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {t('productDetails.openingQuantity')}
            </label>
            <div
              className="text-sm text-gray-900 bg-white px-4 py-3 rounded-lg border"
              style={{ borderColor: `rgb(var(--color-primary-300))` }}
            >
              {opening.quantity}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {t('productDetails.openingPrice')}
            </label>
            <div
              className="text-sm text-gray-900 bg-white px-4 py-3 rounded-lg border"
              style={{ borderColor: `rgb(var(--color-primary-300))` }}
            >
              {formatPrice(opening.price)}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              {t('productDetails.openingDate')}
            </label>
            <div
              className="text-sm text-gray-900 bg-white px-4 py-3 rounded-lg border"
              style={{ borderColor: `rgb(var(--color-primary-300))` }}
            >
              {formatDate(opening.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Galería de imágenes */}
      {product.images && product.images.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {t('productDetails.images', { count: product.images.length })}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={`${process.env.NEXT_PUBLIC_URL_API}${image}`}
                  alt={`${product.name} - Imagen ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border group-hover:opacity-90 transition-opacity"
                  style={{ borderColor: `rgb(var(--color-primary-200))` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
                    {t('productDetails.image', { index: index + 1 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <label
          className="text-sm"
          style={{ color: `rgb(var(--color-primary-500))` }}
        >
          {t('productDetails.productStatus')}
        </label>
        <div className="h-4 w-4">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              product.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.is_active ? t('productDetails.active') : t('productDetails.inactive')}
          </span>
        </div>
      </div>
    </form>
  );
});

ProductDetailsForm.displayName = "ProductDetailsForm";

export default ProductDetailsForm;
