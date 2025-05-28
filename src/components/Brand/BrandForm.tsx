'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { brandService } from '@/services/brand.service';
import { toastService } from '@/services/toast.service';
import { Brand, BrandFormData } from '@/types/brand';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export interface BrandFormProps {
  brand: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface BrandFormRef {
  submit: () => void;
}

interface FormErrors {
  code?: string;
  description?: string;
  img?: string;
}

const BrandForm = forwardRef<BrandFormRef, BrandFormProps>(
  ({ brand, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<BrandFormData>({
      code: '',
      description: '',
      img: null,
      isActive: true,
      imageChanged: false,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (brand) {
        setFormData({
          code: brand.code,
          description: brand.description,
          img: brand.img,
          isActive: brand.isActive,
          imageChanged: false,
        });
      } else {
        setFormData({
          code: '',
          description: '',
          img: null,
          isActive: true,
          imageChanged: false,
        });
      }
    }, [brand]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    }, [formData, imageFile]);

    const handleImageChange = (file: File | null) => {
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        imageChanged: true,
        img: file ? prev.img : null
      }));
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        const data = {
          ...formData,
          code: formData.code.trim(),
          description: formData.description.trim(),
        };

        if (brand) {
          await brandService.updateBrand(brand.id, data, imageFile || undefined);
        } else {
          await brandService.createBrand(data, imageFile || undefined);
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar la marca');
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
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-red-400 mb-2">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: BRAND001"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-400 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Marca de ropa deportiva"
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-red-400 mb-2">
            Imagen {!brand && <span className="text-red-500"></span>}
          </label>
          <ImageUpload
            value={brand?.img || undefined}
            onChange={handleImageChange}
            error={errors.img}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
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

BrandForm.displayName = 'BrandForm';

export default BrandForm; 