'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('pages.warehouses');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const response = await currenciesService.getCurrencies(1);
        setCurrencies(response.data);
      } catch {
        toastService.error(t('currency.errorLoading'));
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
        newErrors.code = t('form.errors.codeRequired');
        isValid = false;
      }

      if (!formData.name.trim()) {
        newErrors.name = t('form.errors.nameRequired');
        isValid = false;
      }

      if (!formData.address.trim()) {
        newErrors.address = t('form.errors.addressRequired');
        isValid = false;
      }

      if (!formData.phone.trim()) {
        newErrors.phone = t('form.errors.phoneRequired');
        isValid = false;
      }

      // Solo validar currency_id si no estamos editando o si estamos creando
      if (!formData.currency_id && !warehouse) {
        newErrors.currency_id = t('form.errors.currencyRequired');
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
          ...(warehouse ? {} : { currencyId: formData.currency_id }),
        };

        if (warehouse) {
          await api.put(`/warehouses/${warehouse.id}`, data);
          toastService.success(t('messages.warehouseUpdated'));
        } else {
          await api.post('/warehouses', data);
          toastService.success(t('messages.warehouseCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(warehouse ? t('messages.errorUpdating') : t('messages.errorCreating'));
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
            label={t('form.code')}
            required
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder={t('form.placeholders.code')}
            error={errors.code}
          />

          <Input
            type="text"
            id="name"
            label={t('form.name')}
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('form.placeholders.name')}
            error={errors.name}
          />

          <TextArea
            id="address"
            label={t('form.address')}
            required
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder={t('form.placeholders.address')}
            error={errors.address}
          />

          <Input
            type="text"
            id="phone"
            label={t('form.phone')}
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder={t('form.placeholders.phone')}
            error={errors.phone}
          />

          <SelectWithAdd
            id="currency_id"
            label={t('form.currency')}
            value={formData.currency_id}
            onChange={(e) => setFormData(prev => ({ ...prev, currency_id: e.target.value }))}
            options={currencies.map((currency) => ({
              value: currency.id,
              label: `${currency.code} - ${currency.name}`
            }))}
            placeholder={t('currency.selectCurrency')}
            required
            disabled={warehouse && !warehouse.is_open}
            error={errors.currency_id}
            loading={loadingCurrencies}
            showAddButton={!warehouse}
            onAddClick={() => setShowCurrencyDrawer(true)}
            addButtonTitle={t('currency.createNewCurrency')}
            helperText={warehouse && !warehouse.is_open ? t('currency.cannotModifyClosed') : undefined}
          />

          <Checkbox
            id="isActive"
            label={t('form.active')}
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
          title={t('currency.newCurrency')}
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