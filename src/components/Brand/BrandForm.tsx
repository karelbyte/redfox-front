'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { brandService } from '@/services/brand.service';
import { toastService } from '@/services/toast.service';
import { Brand, BrandFormData } from '@/types/brand';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { Input, Checkbox } from '@/components/atoms';

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
    const t = useTranslations('pages.brands');
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
        newErrors.code = t('form.errors.codeRequired');
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = t('form.errors.descriptionRequired');
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          toastService.success(t('messages.brandUpdated'));
        } else {
          await brandService.createBrand(data, imageFile || undefined);
          toastService.success(t('messages.brandCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(brand ? t('messages.errorUpdating') : t('messages.errorCreating'));
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
        <Input
          type="text"
          id="code"
          label={t('form.code')}
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder={t('form.placeholders.code')}
          error={errors.code}
        />

        <Input
          type="text"
          id="description"
          label={t('form.description')}
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('form.placeholders.description')}
          error={errors.description}
        />

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            {t('form.image')} {!brand && <span style={{ color: `rgb(var(--color-primary-500))` }}></span>}
          </label>
          <ImageUpload
            value={brand?.img || undefined}
            onChange={handleImageChange}
            error={errors.img}
          />
        </div>

        <Checkbox
          id="isActive"
          label={t('form.active')}
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
      </form>
    );
  }
);

BrandForm.displayName = 'BrandForm';

export default BrandForm; 