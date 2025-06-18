import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Provider } from "@/types/provider";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Input, TextArea } from "@/components/atoms";

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
        <Input
          type="text"
          id="code"
          label="Código"
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="Ej: PROV001"
          error={errors.code}
        />

        <Input
          type="text"
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Proveedor XYZ"
          error={errors.name}
        />

        <TextArea
          id="description"
          label="Descripción"
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Ej: Proveedor de materiales de construcción"
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            id="document"
            label="Documento"
            value={formData.document}
            onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
            placeholder="Ej: RUC 12345678901"
          />

          <Input
            type="text"
            id="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ej: +51 987654321"
          />
        </div>

        <Input
          type="email"
          id="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Ej: contacto@proveedor.com"
          error={errors.email}
        />

        <TextArea
          id="address"
          label="Dirección"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
          placeholder="Ej: Av. Principal 123, Lima"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
            className="h-4 w-4 border-gray-300 rounded"
            style={{
              accentColor: `rgb(var(--color-primary-500))`,
            }}
          />
          <label 
            htmlFor="status" 
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

ProviderForm.displayName = "ProviderForm";

export default ProviderForm; 