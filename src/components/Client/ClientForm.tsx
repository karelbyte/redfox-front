import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";

export interface ClientFormRef {
  submit: () => void;
}

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  tax_document: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  email?: string;
  tax_document?: string;
}

const ClientForm = forwardRef<ClientFormRef, ClientFormProps>(
  ({ client, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      code: client?.code || "",
      name: client?.name || "",
      description: client?.description || "",
      phone: client?.phone || "",
      email: client?.email || "",
      address: client?.address || "",
      tax_document: client?.tax_document || "",
      status: client?.status ?? true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (client) {
        setFormData({
          code: client.code,
          name: client.name,
          description: client.description,
          phone: client.phone || "",
          email: client.email || "",
          address: client.address || "",
          tax_document: client.tax_document || "",
          status: client.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          phone: "",
          email: "",
          address: "",
          tax_document: "",
          status: true,
        });
      }
    }, [client]);

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

      if (!formData.tax_document.trim()) {
        newErrors.tax_document = 'El documento fiscal es requerido';
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
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          tax_document: formData.tax_document.trim(),
          status: formData.status,
        };

        if (client) {
          await clientsService.updateClient(client.id, data);
          toastService.success("Cliente actualizado correctamente");
        } else {
          await clientsService.createClient(data);
          toastService.success("Cliente creado correctamente");
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            client
              ? "Error al actualizar el cliente"
              : "Error al crear el cliente"
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
          <label htmlFor="code" className="block text-sm font-medium text-red-500 mb-2">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Ej: CLI001"
            required
          />
          {errors.code && <p className="mt-1 text-xs text-gray-300">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-red-500 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Ej: Cliente XYZ"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-red-500 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            rows={3}
            placeholder="Ej: Cliente general"
            required
          />
          {errors.description && <p className="mt-1 text-xs text-gray-300">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-red-500 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Ej: +51 987654321"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-red-500 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Ej: contacto@cliente.com"
            />
            {errors.email && <p className="mt-1 text-xs text-gray-300">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-red-500 mb-2">
            Dirección
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            rows={3}
            placeholder="Ej: Av. Principal 123, Lima"
          />
        </div>

        <div>
          <label htmlFor="tax_document" className="block text-sm font-medium text-red-500 mb-2">
            Documento Fiscal
          </label>
          <input
            type="text"
            id="tax_document"
            value={formData.tax_document}
            onChange={(e) => setFormData(prev => ({ ...prev, tax_document: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Ej: RUC 20123456789"
          />
          {errors.tax_document && (
            <p className="mt-1 text-xs text-gray-300">{errors.tax_document}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-red-500">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

ClientForm.displayName = "ClientForm";

export default ClientForm; 