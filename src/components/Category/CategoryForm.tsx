import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { categoriesService } from '@/services/categories.service';
import { toastService } from '@/services/toast.service';
import { Category, CategoryFormData } from '@/types/category';

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
}

const CategoryForm = forwardRef<CategoryFormRef, CategoryFormProps>(
  ({ category, onClose, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<CategoryFormData>({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: null,
      isActive: true,
      position: 1,
    });

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

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
        isValid = false;
      }

      if (!formData.image.trim()) {
        newErrors.image = 'La imagen es requerida';
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
          image: formData.image.trim(),
        };

        if (category) {
          await categoriesService.updateCategory(category.id, data);
          toastService.success('Categoría actualizada correctamente');
        } else {
          await categoriesService.createCategory(data);
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
            placeholder="Ej: Zapatos"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
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
            placeholder="Ej: Productos de calzado"
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-red-400 mb-2">
            URL de la imagen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="image"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: https://ejemplo.com/imagen.jpg"
            required
          />
          {errors.image && <p className="mt-1 text-xs text-gray-300">{errors.image}</p>}
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-red-400 mb-2">
            Posición
          </label>
          <input
            type="number"
            id="position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            min="1"
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

CategoryForm.displayName = 'CategoryForm';

export default CategoryForm; 