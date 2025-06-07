'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Warehouse } from '@/types/warehouse';
import { Currency } from '@/types/currency';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { currenciesService } from '@/services/currencies.service';

interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  currency_id: string;
  isActive: boolean;
}

interface WarehouseFormErrors {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  currency_id?: string;
}

export interface WarehouseFormProps {
  warehouse: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface WarehouseFormRef {
  submit: () => void;
}

const WarehouseForm = forwardRef<WarehouseFormRef, WarehouseFormProps>(
  ({ warehouse, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<WarehouseFormData>({
      code: warehouse?.code || '',
      name: warehouse?.name || '',
      address: warehouse?.address || '',
      phone: warehouse?.phone || '',
      currency_id: typeof warehouse?.currency === 'object' ? warehouse.currency.id : '',
      isActive: warehouse?.status ?? true,
    });

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loadingCurrencies, setLoadingCurrencies] = useState(true);
    const [errors, setErrors] = useState<WarehouseFormErrors>({});

    useEffect(() => {
      fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const response = await currenciesService.getCurrencies(1);
        setCurrencies(response.data);
      } catch (error) {
        toastService.error('Error al cargar monedas');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    useEffect(() => {
      if (warehouse) {
        setFormData({
          code: warehouse.code,
          name: warehouse.name,
          address: warehouse.address,
          phone: warehouse.phone,
          currency_id: typeof warehouse.currency === 'object' ? warehouse.currency.id : '',
          isActive: warehouse.status,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          address: '',
          phone: '',
          currency_id: '',
          isActive: true,
        });
      }
    }, [warehouse]);

    const validateForm = (): boolean => {
      const newErrors: Partial<WarehouseFormErrors> = {};
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

      if (!formData.phone.trim()) {
        newErrors.phone = 'El teléfono es requerido';
        isValid = false;
      }

      if (!formData.currency_id) {
        newErrors.currency_id = 'La moneda es requerida';
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
        onSavingChange?.(true);
        const data = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          currency_id: formData.currency_id,
          status: formData.isActive,
        };

        if (warehouse) {
          await api.put(`/warehouses/${warehouse.id}`, data);
          toastService.success('Almacén actualizado correctamente');
        } else {
          await api.post('/warehouses', data);
          toastService.success('Almacén creado correctamente');
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error('Error al guardar el almacén');
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
            placeholder="Ej: ALM-001"
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
            placeholder="Ej: Almacén Central"
            required
          />
          {errors.name && <p className="mt-1 text-xs text-gray-300">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-red-400 mb-2">
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: Av. Principal #123"
            required
          />
          {errors.address && <p className="mt-1 text-xs text-gray-300">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-red-400 mb-2">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
            placeholder="Ej: +1234567890"
            required
          />
          {errors.phone && <p className="mt-1 text-xs text-gray-300">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="currency_id" className="block text-sm font-medium text-red-400 mb-2">
            Moneda <span className="text-red-500">*</span>
          </label>
          {loadingCurrencies ? (
            <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
          ) : (
            <select
              id="currency_id"
              value={formData.currency_id}
              onChange={(e) => setFormData(prev => ({ ...prev, currency_id: e.target.value }))}
              className="appearance-none block w-full px-4 py-3 border border-red-300 rounded-lg placeholder-red-200 text-black focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition-colors"
              required
            >
              <option value="">Seleccionar moneda...</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          )}
          {errors.currency_id && <p className="mt-1 text-xs text-gray-300">{errors.currency_id}</p>}
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

WarehouseForm.displayName = 'WarehouseForm';

export default WarehouseForm; 