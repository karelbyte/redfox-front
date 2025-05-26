'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Brand } from '@/types/brand';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

interface BrandFormData {
  code: string;
  description: string;
  img: string | null;
  status: boolean;
}

interface BrandFormErrors {
  code?: string;
  description?: string;
  img?: string;
  status?: string;
}

interface BrandFormProps {
  initialData?: Brand;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface BrandFormRef {
  submit: () => void;
}

const BrandForm = forwardRef<BrandFormRef, BrandFormProps>(
  ({ initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<BrandFormData>({
      code: initialData?.code || '',
      description: initialData?.description || '',
      img: initialData?.img || null,
      status: initialData?.status ?? true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<BrandFormErrors>({});

    useEffect(() => {
      if (initialData) {
        setFormData({
          code: initialData.code,
          description: initialData.description,
          img: initialData.img,
          status: initialData.status,
        });
      } else {
        setFormData({
          code: '',
          description: '',
          img: null,
          status: true,
        });
      }
    }, [initialData]);

    const validateForm = (): boolean => {
      const newErrors: Partial<BrandFormData> = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
        isValid = false;
      }

      setErrors(newErrors as BrandFormErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, imageFile]);

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        const formDataToSend = new FormData();
        formDataToSend.append('code', formData.code.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('status', formData.status.toString());
        if (imageFile) {
          formDataToSend.append('img', imageFile);
        }

        if (initialData) {
          await api.put(`/brands/${initialData.id}`, formDataToSend);
          toastService.success('Marca actualizada correctamente');
        } else {
          await api.post('/brands', formDataToSend);
          toastService.success('Marca creada correctamente');
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
            placeholder="Ej: Zapatos Negros"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-400 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Productos de calzado para hombres negros"
            rows={3}
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-red-400 mb-2">
            Imagen {!initialData && <span className="text-red-500">*</span>}
          </label>
          <ImageUpload
            value={formData.img || undefined}
            onChange={setImageFile}
            error={errors.img}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-red-400">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

BrandForm.displayName = 'BrandForm';

export default BrandForm; 