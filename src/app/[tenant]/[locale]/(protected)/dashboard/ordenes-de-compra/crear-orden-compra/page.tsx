'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { purchaseOrdersService } from '@/services';
import { providersService } from '@/services/providers.service';
import { warehousesService } from '@/services/warehouses.service';
import { toastService } from '@/services/toast.service';
import { Provider } from '@/types/provider';
import { Warehouse } from '@/types/warehouse';
import { Btn, Input, Select, SelectWithAdd, TextArea } from '@/components/atoms';
import { SurrogateInput } from '@/components/atoms/SurrogateInput';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import ProviderForm from '@/components/Provider/ProviderForm';
import { ProviderFormRef } from '@/components/Provider/ProviderForm';
import { usePermissions } from '@/hooks/usePermissions';

// Tipo específico para el estado del formulario
interface FormState {
  code: string;
  date: string;
  provider_id: string;
  warehouse_id: string;
  document: string;
  amount: number;
  notes: string;
  expected_delivery_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.purchaseOrders');
  const { can } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState<FormState>({
    code: '',
    date: new Date().toISOString().split('T')[0],
    provider_id: '',
    warehouse_id: '',
    document: '',
    amount: 0,
    notes: '',
    expected_delivery_date: new Date().toISOString().split('T')[0],
    status: 'PENDING'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Estados para el drawer de proveedores
  const [showProviderDrawer, setShowProviderDrawer] = useState(false);
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [isProviderFormValid, setIsProviderFormValid] = useState(false);
  const providerFormRef = useRef<ProviderFormRef>(null);

  useEffect(() => {
    fetchProviders();
    fetchWarehouses();
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
    } catch  {
      toastService.error(t('messages.errorLoadingProviders'));
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehousesService.getWarehouses({ isClosed: true });
      setWarehouses(response.data || []);
    } catch  {
      toastService.error(t('messages.errorLoadingWarehouses'));
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.date) {
      newErrors.date = t('form.errors.dateRequired');
    }

    if (!formData.provider_id) {
      newErrors.provider_id = t('form.errors.providerRequired');
    }

    // warehouse_id es opcional — el almacén se define por producto al agregar detalles

    // document es opcional — referencia del proveedor

    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = t('form.errors.expectedDeliveryDateRequired');
    }

    const valid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(valid);
    return valid;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? Number(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const purchaseOrder = await purchaseOrdersService.createPurchaseOrder({
        code: formData.code.trim(),
        date: formData.date,
        provider_id: formData.provider_id,
        ...(formData.warehouse_id ? { warehouse_id: formData.warehouse_id } : {}),
        ...(formData.document.trim() ? { document: formData.document.trim() } : {}),
        amount: 0,
        notes: formData.notes?.trim() || '',
        expected_delivery_date: formData.expected_delivery_date,
        status: formData.status
      });

      toastService.success(t('messages.purchaseOrderCreated'));
      
      // Redirigir a la página de detalles de la orden de compra creada
      router.push(`/${locale}/dashboard/ordenes-de-compra/ordenes-de-compra/${purchaseOrder.id}`);
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
    router.push(`/${locale}/dashboard/ordenes-de-compra`);
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

  if (!can(["purchase_order_create"])) {
    return <div>{t('noPermissionDesc')}</div>;
  }

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
          {t('actions.back')}
        </Btn>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('actions.create')}
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
              {/* Fila 1: Código + Fecha */}
              <div>
                <SurrogateInput
                  label={t('form.code')}
                  placeholder={t('form.placeholders.code')}
                  value={formData.code}
                  onChange={(value) => handleInputChange('code', value)}
                  surrogateCode="purchase_order"
                  error={errors.code}
                  required
                />
              </div>

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

              {/* Fila 2: Proveedor a todo el ancho */}
              <div className="md:col-span-2">
                <SelectWithAdd
                  id="provider-select"
                  label={t('form.provider')}
                  placeholder={t('form.placeholders.provider')}
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

              {/* Fila 3: Documento + Fecha de entrega */}
              <div>
                <Input
                  label={`${t('form.document')} (${t('form.optional')})`}
                  placeholder={t('form.placeholders.document')}
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  error={errors.document}
                  helperText={t('form.documentHint')}
                />
              </div>

              <div>
                <Input
                  type="date"
                  label={t('form.expectedDeliveryDate')}
                  value={formData.expected_delivery_date}
                  onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                  error={errors.expected_delivery_date}
                  required
                />
              </div>

              {/* Notas — a todo el ancho, al final */}
              <div className="md:col-span-2">
                <TextArea
                  label={t('form.notes')}
                  placeholder={t('form.placeholders.notes')}
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end">
            <Btn
              type="submit"
              loading={loading}
              disabled={loading || !isFormValid}
            >
              {loading ? t('actions.saving') : t('actions.create')}
            </Btn>
          </div>
        </form>
      </div>

      {/* Drawer para crear proveedores */}
      <Drawer
        id="provider-drawer"
        isOpen={showProviderDrawer}
        onClose={handleProviderDrawerClose}
        title={t('actions.createNewProvider')}
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