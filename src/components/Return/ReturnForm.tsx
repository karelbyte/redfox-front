'use client';

import { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { ReturnFormData, Warehouse } from '@/types/return';
import { Provider } from '@/types/provider';
import { Input, Select, TextArea } from '@/components/atoms';
import { providersService, returnService, toastService } from '@/services';

export interface ReturnFormRef {
  submit: () => void;
}

interface ReturnFormProps {
  warehouses: Warehouse[];
  initialData?: ReturnFormData;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (saving: boolean) => void;
  onValidChange: (valid: boolean) => void;
}

const ReturnForm = forwardRef<ReturnFormRef, ReturnFormProps>(
  ({ warehouses, initialData, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.returns.form');
    const [formData, setFormData] = useState<ReturnFormData>({
      code: '',
      sourceWarehouseId: '',
      targetProviderId: '',
      date: '',
      description: ''
    });
    const [providers, setProviders] = useState<Provider[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [, setIsLoadingProviders] = useState(false);

    // Cargar proveedores
    useEffect(() => {
      const loadProviders = async () => {
        try {
          setIsLoadingProviders(true);
          const response = await providersService.getProviders();
          setProviders(response.data);
        } catch (error) {
          console.error('Error loading providers:', error);
        } finally {
          setIsLoadingProviders(false);
        }
      };
      loadProviders();
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Establecer fecha actual para nuevas devoluciones
        setFormData(prev => ({
          ...prev,
          date: new Date().toISOString().split('T')[0]
        }));
      }
    }, [initialData]);

    // Validar formulario
    useEffect(() => {
      const isValid = validateForm();
      onValidChange(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.code.trim()) {
        newErrors.code = t('validation.codeRequired');
      }

      if (!formData.sourceWarehouseId) {
        newErrors.sourceWarehouseId = t('validation.sourceWarehouseRequired');
      }

      if (!formData.targetProviderId) {
        newErrors.targetProviderId = t('validation.targetProviderRequired');
      }

      if (!formData.date) {
        newErrors.date = t('validation.dateRequired');
      }

      if (!formData.description.trim()) {
        newErrors.description = t('validation.descriptionRequired');
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange(true);
        const data = {
          ...formData,
          code: formData.code.trim(),
          description: formData.description.trim(),
        };

        if (initialData && 'id' in initialData) {
          // Actualizar devolución existente
          await returnService.updateReturn((initialData as ReturnFormData & { id: string }).id, data);
        } else {
          // Crear nueva devolución
          await returnService.createReturn(data);
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(t('messages.errorCreating'));
        }
      } finally {
        onSavingChange(false);
      }
    };

    // Exponer método submit usando useImperativeHandle
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    return (
      <form className="space-y-6">
        <Input
          id="code"
          label={t('code')}
          required
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder={t('placeholders.code')}
          error={errors.code}
        />

        <Input
          id="date"
          type="date"
          label={t('date')}
          required
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          error={errors.date}
        />

        <Select
          id="sourceWarehouseId"
          label={t('sourceWarehouse')}
          required
          value={formData.sourceWarehouseId}
          onChange={(e) => setFormData(prev => ({ ...prev, sourceWarehouseId: e.target.value }))}
          placeholder={t('placeholders.sourceWarehouse')}
          error={errors.sourceWarehouseId}
          options={warehouses.map(warehouse => ({
            value: warehouse.id,
            label: `${warehouse.name} (${warehouse.code})`
          }))}
        />

        <Select
          id="targetProviderId"
          label={t('targetProvider')}
          required
          value={formData.targetProviderId}
          onChange={(e) => setFormData(prev => ({ ...prev, targetProviderId: e.target.value }))}
          placeholder={t('placeholders.targetProvider')}
          error={errors.targetProviderId}
          options={providers.map(provider => ({
            value: provider.id,
            label: `${provider.name} (${provider.code})`
          }))}
        />

        <TextArea
          id="description"
          label={t('description')}
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('placeholders.description')}
          error={errors.description}
          rows={3}
        />
      </form>
    );
  }
);

ReturnForm.displayName = 'ReturnForm';

export default ReturnForm; 