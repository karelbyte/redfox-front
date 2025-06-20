'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Warehouse } from '@/types/warehouse';
import { Currency } from '@/types/currency';
import { api } from '@/services/api';
import { toastService } from '@/services/toast.service';
import { currenciesService } from '@/services/currencies.service';
import { Input, TextArea, SelectWithAdd, Checkbox } from '@/components/atoms';
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

          <SelectWithAdd
            id="currency_id"
            label="Moneda"
            value={formData.currency_id}
            onChange={(e) => setFormData(prev => ({ ...prev, currency_id: e.target.value }))}
            options={currencies.map((currency) => ({
              value: currency.id,
              label: `${currency.code} - ${currency.name}`
            }))}
            placeholder="Seleccionar moneda..."
            required
            disabled={warehouse && !warehouse.is_open}
            error={errors.currency_id}
            loading={loadingCurrencies}
            showAddButton={!warehouse}
            onAddClick={() => setShowCurrencyDrawer(true)}
            addButtonTitle="Crear nueva moneda"
            helperText={warehouse && !warehouse.is_open ? "(No se puede modificar en cierre de almacén)" : undefined}
          />

          <Checkbox
            id="isActive"
            label="Activo"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          />
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