'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { receptionService } from '@/services/receptions.service';
import { providersService } from '@/services/providers.service';
import { warehousesService } from '@/services/warehouses.service';
import { toastService } from '@/services/toast.service';
import { Reception, ReceptionFormData } from '@/types/reception';
import { Provider } from '@/types/provider';
import { Warehouse } from '@/types/warehouse';
import { Input } from '@/components/atoms';
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
  providerId?: string;
  warehouseId?: string;
  document?: string;
}

const ReceptionForm = forwardRef<ReceptionFormRef, ReceptionFormProps>(
  ({ reception, onSuccess, onSavingChange, onValidChange }, ref) => {
    const [formData, setFormData] = useState<ReceptionFormData>({
      code: '',
      date: '',
      providerId: '',
      warehouseId: '',
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
          providerId: reception.provider.id,
          warehouseId: reception.warehouse.id,
          document: reception.document,
        });
      } else {
        setFormData({
          code: '',
          date: new Date().toISOString().split('T')[0], // Fecha actual
          providerId: '',
          warehouseId: '',
          document: '',
        });
      }
    }, [reception]);

    const loadProviders = async () => {
      try {
        const response = await providersService.getProviders(1);
        setProviders(response.data || []);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      }
    };

    const loadWarehouses = async () => {
      try {
        const response = await warehousesService.getWarehouses(1);
        setWarehouses(response.data || []);
      } catch (error) {
        console.error('Error cargando almacenes:', error);
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        isValid = false;
      }

      if (!formData.date) {
        newErrors.date = 'La fecha es requerida';
        isValid = false;
      }

      if (!formData.providerId) {
        newErrors.providerId = 'El proveedor es requerido';
        isValid = false;
      }

      if (!formData.warehouseId) {
        newErrors.warehouseId = 'El almacén es requerido';
        isValid = false;
      }

      if (!formData.document.trim()) {
        newErrors.document = 'El documento es requerido';
        isValid = false;
      }

      setErrors(newErrors);
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
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
          toastService.error('Error al guardar la recepción');
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

    const getInputStyles = () => ({
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      outline: 'none',
      transition: 'all 0.2s',
    });

    const handleInputFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = `rgb(var(--color-primary-500))`;
      e.target.style.boxShadow = `0 0 0 3px rgba(var(--color-primary-500), 0.1)`;
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.target.style.borderColor = '#d1d5db';
      e.target.style.boxShadow = 'none';
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
            label="Código"
            required
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Ej: REC-2024-001"
            error={errors.code}
          />

          <Input
            type="date"
            id="date"
            label="Fecha"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            error={errors.date}
          />

          <div>
            <label 
              htmlFor="provider" 
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              Proveedor <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
            </label>
            <div className="relative">
              <select
                id="provider"
                value={formData.providerId}
                onChange={(e) => setFormData(prev => ({ ...prev, providerId: e.target.value }))}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{
                  ...getInputStyles(),
                  paddingRight: '3rem', // Espacio para el botón
                }}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.code} - {provider.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowProviderDrawer(true)}
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
                title="Crear nuevo proveedor"
              >
                +
              </button>
            </div>
            {errors.providerId && (
              <p className="mt-1 text-xs text-gray-300">{errors.providerId}</p>
            )}
          </div>

          <div>
            <label 
              htmlFor="warehouse" 
              className="block text-sm font-medium mb-2"
              style={{ color: `rgb(var(--color-primary-500))` }}
            >
              Almacén <span style={{ color: `rgb(var(--color-primary-500))` }}>*</span>
            </label>
            <select
              id="warehouse"
              value={formData.warehouseId}
              onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={getInputStyles()}
              required
            >
              <option value="">Seleccione un almacén</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="mt-1 text-xs text-gray-300">{errors.warehouseId}</p>
            )}
          </div>

          <Input
            type="text"
            id="document"
            label="Documento"
            required
            value={formData.document}
            onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
            placeholder="Ej: FACT-001-2024"
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