import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Input, TextArea } from "@/components/atoms";

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
        newErrors.code = "El código es requerido";
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = "La descripción es requerida";
        isValid = false;
      }

      if (!formData.tax_document.trim()) {
        newErrors.tax_document = "El documento fiscal es requerido";
        isValid = false;
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "El email no es válido";
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
        <Input
          type="text"
          id="code"
          label="Código"
          required
          value={formData.code}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, code: e.target.value }))
          }
          placeholder="Ej: CLI001"
          error={errors.code}
        />

        <Input
          type="text"
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Ej: Cliente XYZ"
          error={errors.name}
        />

        <TextArea
          id="description"
          label="Descripción"
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          placeholder="Ej: Cliente general"
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            id="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Ej: +51 987654321"
          />

          <Input
            type="email"
            id="email"
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Ej: contacto@cliente.com"
            error={errors.email}
          />
        </div>

        <TextArea
          id="address"
          label="Dirección"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          rows={3}
          placeholder="Ej: Av. Principal 123, Lima"
        />

        <Input
          type="text"
          id="tax_document"
          label="Documento Fiscal"
          required
          value={formData.tax_document}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tax_document: e.target.value }))
          }
          placeholder="Ej: RUC 20123456789"
          error={errors.tax_document}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.checked }))
            }
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

ClientForm.displayName = "ClientForm";

export default ClientForm;
