import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Provider } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";

export interface ProviderFormRef {
  submit: () => void;
}

interface ProviderFormProps {
  provider?: Provider | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  email?: string;
}

const ProviderForm = forwardRef<ProviderFormRef, ProviderFormProps>(
  ({ provider, onClose, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      code: provider?.code || "",
      name: provider?.name || "",
      description: provider?.description || "",
      document: provider?.document || "",
      phone: provider?.phone || "",
      email: provider?.email || "",
      address: provider?.address || "",
      status: provider?.status ?? true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (provider) {
        setFormData({
          code: provider.code,
          name: provider.name,
          description: provider.description,
          document: provider.document || "",
          phone: provider.phone || "",
          email: provider.email || "",
          address: provider.address || "",
          status: provider.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          document: "",
          phone: "",
          email: "",
          address: "",
          status: true,
        });
      }
    }, [provider]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'La descripción es requerida';
        isValid = false;
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'El email no es válido';
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange(true);
        const data = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          document: formData.document.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          status: formData.status,
        };

        if (provider) {
          await providersService.updateProvider(provider.id, data);
          toastService.success("Proveedor actualizado correctamente");
        } else {
          await providersService.createProvider(data);
          toastService.success("Proveedor creado correctamente");
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            provider
              ? "Error al actualizar el proveedor"
              : "Error al crear el proveedor"
          );
        }
      } finally {
        onSavingChange(false);
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
            placeholder="Ej: PROV001"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

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
            placeholder="Ej: Proveedor XYZ"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
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
            rows={3}
            placeholder="Ej: Proveedor de materiales de construcción"
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-red-400 mb-2">
              Documento
            </label>
            <input
              type="text"
              id="document"
              value={formData.document}
              onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              placeholder="Ej: RUC 12345678901"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-red-400 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              placeholder="Ej: +51 987654321"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-red-400 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: contacto@proveedor.com"
          />
          {errors.email && <p className="mt-1 text-xs text-gray-300">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-red-400 mb-2">
            Dirección
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            rows={3}
            placeholder="Ej: Av. Principal 123, Lima"
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

ProviderForm.displayName = "ProviderForm";

export default ProviderForm; 