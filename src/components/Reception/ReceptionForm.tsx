'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { receptionService } from '@/services/receptions.service';
import { providersService } from '@/services/providers.service';
import { warehousesService } from '@/services/warehouses.service';
import { toastService } from '@/services/toast.service';
import { Reception, ReceptionFormData } from '@/types/reception';
import { Provider } from '@/types/provider';
import { Warehouse } from '@/types/warehouse';
import { Input, Select, SelectWithAdd } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import ProviderForm from '@/components/Provider/ProviderForm';
import { ProviderFormRef } from '@/components/Provider/ProviderForm';

export interface ReceptionFormProps {
  reception: Reception | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface ReceptionFormRef {
  submit: () => void;
}

interface FormErrors {
  code?: string;
  date?: string;
  provider_id?: string;
  warehouse_id?: string;
  document?: string;
}

const ReceptionForm = forwardRef<ReceptionFormRef, ReceptionFormProps>(
  ({ reception, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.receptions');
    const [formData, setFormData] = useState<ReceptionFormData>({
      code: '',
      date: '',
      provider_id: '',
      warehouse_id: '',
      document: '',
    });

    const [providers, setProviders] = useState<Provider[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    // Estados para el drawer de proveedores
    const [showProviderDrawer, setShowProviderDrawer] = useState(false);
    const [isSavingProvider, setIsSavingProvider] = useState(false);
    const [isProviderFormValid, setIsProviderFormValid] = useState(false);
    const providerFormRef = useRef<ProviderFormRef>(null);

    useEffect(() => {
      loadProviders();
      loadWarehouses();
    }, []);

    useEffect(() => {
      if (reception) {
        setFormData({
          code: reception.code,
          date: reception.date,
          provider_id: reception.provider.id,
          warehouse_id: reception.warehouse.id,
          document: reception.document,
        });
      } else {
        setFormData({
          code: '',
          date: new Date().toISOString().split('T')[0], // Fecha actual
          provider_id: '',
          warehouse_id: '',
          document: '',
        });
      }
    }, [reception]);

    const loadProviders = async () => {
      try {
        const response = await providersService.getProviders();
        setProviders(response.data || []);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      }
    };

    const loadWarehouses = async () => {
      try {
        const response = await warehousesService.getWarehouses({isClosed:true});
        setWarehouses(response.data || []);
      } catch (error) {
        console.error('Error cargando almacenes:', error);
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.code.trim()) {
        newErrors.code = t('form.errors.codeRequired');
      }

      if (!formData.date) {
        newErrors.date = t('form.errors.dateRequired');
      }

      if (!formData.provider_id) {
        newErrors.provider_id = t('form.errors.providerRequired');
      }

      if (!formData.warehouse_id) {
        newErrors.warehouse_id = t('form.errors.warehouseRequired');
      }

      if (!formData.document.trim()) {
        newErrors.document = t('form.errors.documentRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
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
          ...formData,
          code: formData.code.trim(),
          document: formData.document.trim(),
        };

        if (reception) {
          await receptionService.updateReception(reception.id, data);
        } else {
          await receptionService.createReception(data);
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(t('messages.errorCreating'));
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    // Handlers para el drawer de proveedores
    const handleProviderDrawerClose = () => {
      setShowProviderDrawer(false);
      setIsSavingProvider(false);
    };

    const handleProviderFormSuccess = () => {
      handleProviderDrawerClose();
      loadProviders(); // Recargar proveedores
    };

    const handleProviderSave = () => {
      if (providerFormRef.current) {
        providerFormRef.current.submit();
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

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
            type="date"
            id="date"
            label={t('form.date')}
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            error={errors.date}
          />

          <SelectWithAdd
            id="provider"
            label={t('form.provider')}
            value={formData.provider_id}
            onChange={(e) => setFormData(prev => ({ ...prev, provider_id: e.target.value }))}
            options={providers.map((provider) => ({
              value: provider.id,
              label: `${provider.code} - ${provider.name}`
            }))}
            placeholder="Seleccione un proveedor"
            required
            error={errors.provider_id}
            showAddButton
            onAddClick={() => setShowProviderDrawer(true)}
            addButtonTitle={t('actions.createNewProvider')}
          />

          <Select
            id="warehouse"
            label={t('form.warehouse')}
            value={formData.warehouse_id}
            onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
            options={warehouses.map((warehouse) => ({
              value: warehouse.id,
              label: `${warehouse.code} - ${warehouse.name}`
            }))}
            placeholder="Seleccione un almacén"
            required
            error={errors.warehouse_id}
          />

          <Input
            type="text"
            id="document"
            label={t('form.document')}
            required
            value={formData.document}
            onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
            placeholder={t('form.placeholders.document')}
            error={errors.document}
          />
        </form>

        {/* Drawer para crear proveedores */}
        <Drawer
          id="provider-drawer"
          parentId="reception-drawer"
          isOpen={showProviderDrawer}
          onClose={handleProviderDrawerClose}
          title="Nuevo Proveedor"
          onSave={handleProviderSave}
          isSaving={isSavingProvider}
          isFormValid={isProviderFormValid}
        >
          <ProviderForm
            ref={providerFormRef}
            provider={null}
            onClose={handleProviderDrawerClose}
            onSuccess={handleProviderFormSuccess}
            onSavingChange={setIsSavingProvider}
            onValidChange={setIsProviderFormValid}
          />
        </Drawer>
      </>
    );
  }
);

ReceptionForm.displayName = 'ReceptionForm';

export default ReceptionForm; 