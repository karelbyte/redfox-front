'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Warehouse } from '@/types/warehouse';
import { Currency } from '@/types/currency';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { currenciesService } from '@/services/currencies.service';
import { Input, TextArea } from '@/components/atoms';
import CurrencyForm from '@/components/Currency/CurrencyForm';
import { CurrencyFormRef } from '@/components/Currency/CurrencyForm';
import Drawer from '@/components/Drawer/Drawer';

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

    // Estados para el drawer de monedas
    const [showCurrencyDrawer, setShowCurrencyDrawer] = useState(false);
    const [isSavingCurrency, setIsSavingCurrency] = useState(false);
    const [isCurrencyFormValid, setIsCurrencyFormValid] = useState(false);
    const currencyFormRef = useRef<CurrencyFormRef>(null);

    useEffect(() => {
      fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const response = await currenciesService.getCurrencies(1);
        setCurrencies(response.data);
      } catch {
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

      // Solo validar currency_id si no estamos editando o si estamos creando
      if (!formData.currency_id && !warehouse) {
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
          status: formData.isActive,
          ...(warehouse ? {} : { currency_id: formData.currency_id }),
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

    // Handlers para el drawer de monedas
    const handleCurrencyDrawerClose = () => {
      setShowCurrencyDrawer(false);
    };

    const handleCurrencyFormSuccess = () => {
      handleCurrencyDrawerClose();
      fetchCurrencies(); // Recargar monedas
    };

    const handleCurrencySave = () => {
      currencyFormRef.current?.submit();
    };

    // Estilos para el select con focus dinámico
    const getSelectStyles = () => ({
      appearance: 'none' as const,
      display: 'block',
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    });

    const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = `rgb(var(--color-primary-500))`;
      e.target.style.boxShadow = `0 0 0 1px rgba(var(--color-primary-500), 0.1)`;
    };

    const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
    };

    return (
      <>
        <form className="space-y-6">
          <Input
            type="text"
            id="code"
            label="Código"
            required
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Ej: ALM-001"
            error={errors.code}
          />

          <Input
            type="text"
            id="name"
            label="Nombre"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Almacén Central"
            error={errors.name}
          />

          <TextArea
            id="address"
            label="Dirección"
            required
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Ej: Av. Principal #123"
            error={errors.address}
          />

          <Input
            type="text"
            id="phone"
            label="Teléfono"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ej: +1234567890"
            error={errors.phone}
          />

          <div>
            <label 
              htmlFor="currency_id" 
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              Moneda <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
              {warehouse && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (No se puede modificar en edición)
                </span>
              )}
            </label>
            {loadingCurrencies ? (
              <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
            ) : (
              <div className="relative">
                <select
                  id="currency_id"
                  value={formData.currency_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency_id: e.target.value }))}
                  onFocus={handleSelectFocus}
                  onBlur={handleSelectBlur}
                  style={{
                    ...getSelectStyles(),
                    paddingRight: '3rem', // Espacio para el botón
                    ...(warehouse && {
                      backgroundColor: '#f3f4f6',
                      cursor: 'not-allowed',
                    }),
                  }}
                  disabled={!!warehouse}
                  required
                >
                  <option value="">Seleccionar moneda...</option>
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {!warehouse && (
                  <button
                    type="button"
                    onClick={() => setShowCurrencyDrawer(true)}
                    className="absolute right-0 top-0 h-full px-3 text-white transition-colors border-l font-bold text-lg"
                    style={{ 
                      backgroundColor: `rgb(var(--color-primary-500))`,
                      borderColor: `rgb(var(--color-primary-600))`,
                      borderTopRightRadius: '0.5rem',
                      borderBottomRightRadius: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-600))`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `rgb(var(--color-primary-500))`;
                    }}
                    title="Crear nueva moneda"
                  >
                    +
                  </button>
                )}
              </div>
            )}
            {errors.currency_id && <p className="mt-1 text-xs text-gray-300">{errors.currency_id}</p>}
          </div>

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

        {/* Drawer para crear monedas */}
        <Drawer
          id="currency-drawer"
          parentId="warehouse-drawer"
          isOpen={showCurrencyDrawer}
          onClose={handleCurrencyDrawerClose}
          title="Nueva Moneda"
          onSave={handleCurrencySave}
          isSaving={isSavingCurrency}
          isFormValid={isCurrencyFormValid}
        >
          <CurrencyForm
            ref={currencyFormRef}
            initialData={null}
            onClose={handleCurrencyDrawerClose}
            onSuccess={handleCurrencyFormSuccess}
            onSavingChange={setIsSavingCurrency}
            onValidChange={setIsCurrencyFormValid}
          />
        </Drawer>
      </>
    );
  }
);

WarehouseForm.displayName = 'WarehouseForm';

export default WarehouseForm; 