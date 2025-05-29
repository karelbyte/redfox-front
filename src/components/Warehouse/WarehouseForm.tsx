import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Warehouse } from "@/types/warehouse";
import { warehousesService } from "@/services/warehouses.service";
import { toastService } from "@/services/toast.service";

export interface WarehouseFormRef {
  submit: () => void;
}

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

interface FormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  status: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  address?: string;
}

const WarehouseForm = forwardRef<WarehouseFormRef, WarehouseFormProps>(
  ({ warehouse, onClose, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      code: warehouse?.code || "",
      name: warehouse?.name || "",
      address: warehouse?.address || "",
      phone: warehouse?.phone || "",
      status: warehouse?.status ?? true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (warehouse) {
        setFormData({
          code: warehouse.code,
          name: warehouse.name,
          address: warehouse.address,
          phone: warehouse.phone || "",
          status: warehouse.status,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          address: "",
          phone: "",
          status: true,
        });
      }
    }, [warehouse]);

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

      if (!formData.address.trim()) {
        newErrors.address = 'La dirección es requerida';
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
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          status: formData.status,
        };

        if (warehouse) {
          await warehousesService.updateWarehouse(warehouse.id, data);
          toastService.success("Almacén actualizado correctamente");
        } else {
          await warehousesService.createWarehouse(data);
          toastService.success("Almacén creado correctamente");
        }
        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            warehouse
              ? "Error al actualizar el almacén"
              : "Error al crear el almacén"
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Ej: ALM001"
            required
          />
          {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Ej: Almacén Principal"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
            rows={3}
            placeholder="Ej: Av. Principal 123"
            required
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
            Activo
          </label>
        </div>
      </form>
    );
  }
);

WarehouseForm.displayName = "WarehouseForm";

export default WarehouseForm; 