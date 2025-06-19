/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { categoriesService } from '@/services/categories.service';
import { toastService } from '@/services/toast.service';
import { Category, CategoryFormData } from '@/types/category';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { Input } from '@/components/atoms';

export interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface CategoryFormRef {
  submit: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  image?: string;
  slug?: string;
}

const CategoryForm = forwardRef<CategoryFormRef, CategoryFormProps>(
  ({ category, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<CategoryFormData>({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: null,
      isActive: true,
      position: 1,
      imageChanged: false,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (category) {
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          isActive: category.isActive,
          position: category.position,
          imageChanged: false,
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
          image: '',
          parentId: null,
          isActive: true,
          position: 1,
          imageChanged: false,
        });
      }
    }, [category]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
        isValid = false;
      }

      if (!formData.slug.trim()) {
        newErrors.slug = 'El slug es requerido';
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
        image: file ? prev.image : ''
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
          name: formData.name.trim(),
          description: formData.description.trim(),
        };

        if (category) {
          await categoriesService.updateCategory(category.id, data, imageFile || undefined);
          toastService.success('Categoría actualizada correctamente');
        } else {
          await categoriesService.createCategory(data, imageFile || undefined);
          toastService.success('Categoría creada correctamente');
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar la categoría');
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
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Zapatos"
          error={errors.name}
        />

        <Input
          type="text"
          id="slug"
          label="Slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          placeholder="Ej: zapatos"
          error={errors.slug}
        />

        <Input
          type="text"
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ej: Productos de calzado"
        />

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-500))` }}
          >
            Imagen
          </label>
          <ImageUpload
            value={category?.image}
            onChange={handleImageChange}
            error={errors.image}
          />
        </div>

        <Input
          type="number"
          id="position"
          label="Posición"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
          min="1"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
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
    );
  }
);

CategoryForm.displayName = 'CategoryForm';

export default CategoryForm; 