'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { receptionService } from '@/services/receptions.service';
import { providersService } from '@/services/providers.service';
import { warehousesService } from '@/services/warehouses.service';
import { toastService } from '@/services/toast.service';
import { ReceptionFormData } from '@/types/reception';
import { Provider } from '@/types/provider';
import { Warehouse } from '@/types/warehouse';
import { Btn, Input, Select, SelectWithAdd } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import ProviderForm from '@/components/Provider/ProviderForm';
import { ProviderFormRef } from '@/components/Provider/ProviderForm';

export default function CreateReceptionPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.receptions');
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState<ReceptionFormData>({
    code: '',
    date: new Date().toISOString().split('T')[0], // Fecha actual
    provider_id: '',
    warehouse_id: '',
    document: ''
  });
  const [errors, setErrors] = useState<Partial<ReceptionFormData>>({});

  // Estados para el drawer de proveedores
  const [showProviderDrawer, setShowProviderDrawer] = useState(false);
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [isProviderFormValid, setIsProviderFormValid] = useState(false);
  const providerFormRef = useRef<ProviderFormRef>(null);

  useEffect(() => {
    fetchProviders();
    fetchWarehouses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await providersService.getProviders();
      setProviders(response.data || []);
    } catch (error) {
      toastService.error('Error al cargar proveedores');
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehousesService.getWarehouses({ isClosed: true });
      setWarehouses(response.data || []);
    } catch (error) {
      toastService.error('Error al cargar almacenes');
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReceptionFormData> = {};

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
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ReceptionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación que muestra errores
    const newErrors: Partial<ReceptionFormData> = {};

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

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const reception = await receptionService.createReception({
        code: formData.code.trim(),
        date: formData.date,
        provider_id: formData.provider_id,
        warehouse_id: formData.warehouse_id,
        document: formData.document.trim()
      });

      toastService.success(t('messages.receptionCreated'));
      
      // Redirigir a la página de detalles de la recepción creada
      router.push(`/${locale}/dashboard/recepciones/recepciones/${reception.id}`);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorCreating'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`);
  };

  // Handlers para el drawer de proveedores
  const handleProviderDrawerClose = () => {
    setShowProviderDrawer(false);
    setIsSavingProvider(false);
  };

  const handleProviderFormSuccess = () => {
    handleProviderDrawerClose();
    fetchProviders(); // Recargar proveedores
  };

  const handleProviderSave = () => {
    if (providerFormRef.current) {
      providerFormRef.current.submit();
    }
  };

  if (loadingProviders || loadingWarehouses) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Btn
          variant="ghost"
          onClick={handleCancel}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Volver
        </Btn>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('newReception')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('form.subtitle')}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
              {t('form.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div>
                <Input
                  label={t('form.code')}
                  placeholder={t('form.placeholders.code')}
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  error={errors.code}
                  required
                />
              </div>

              {/* Fecha */}
              <div>
                <Input
                  type="date"
                  label={t('form.date')}
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={errors.date}
                  required
                />
              </div>

              {/* Proveedor */}
              <div>
                <SelectWithAdd
                  label={t('form.provider')}
                  placeholder="Seleccione un proveedor"
                  value={formData.provider_id}
                  onChange={(e) => handleInputChange('provider_id', e.target.value)}
                  error={errors.provider_id}
                  required
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: `${provider.code} - ${provider.name}`
                  }))}
                  showAddButton
                  onAddClick={() => setShowProviderDrawer(true)}
                  addButtonTitle={t('actions.createNewProvider')}
                />
              </div>

              {/* Almacén */}
              <div>
                <Select
                  label={t('form.warehouse')}
                  placeholder="Seleccione un almacén"
                  value={formData.warehouse_id}
                  onChange={(e) => handleInputChange('warehouse_id', e.target.value)}
                  error={errors.warehouse_id}
                  required
                  options={warehouses.map((warehouse) => ({
                    value: warehouse.id,
                    label: `${warehouse.code} - ${warehouse.name}`
                  }))}
                />
              </div>

              {/* Documento */}
              <div className="md:col-span-2">
                <Input
                  label={t('form.document')}
                  placeholder={t('form.placeholders.document')}
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  error={errors.document}
                  required
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end">
            <Btn
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Recepción'}
            </Btn>
          </div>
        </form>
      </div>

      {/* Drawer para crear proveedores */}
      <Drawer
        id="provider-drawer"
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
    </div>
  );
} 