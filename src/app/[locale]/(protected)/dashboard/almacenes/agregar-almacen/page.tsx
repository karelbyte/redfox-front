'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { warehousesService } from '@/services/warehouses.service';
import { currenciesService } from '@/services/currencies.service';
import { toastService } from '@/services/toast.service';
import { Currency } from '@/types/currency';
import { Btn, Input, Select, Checkbox } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  currencyId: string;
  status: boolean;
}

export default function AgregarAlmacenPage() {
  const { can } = usePermissions();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.warehouses');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState<WarehouseFormData>({
    code: '',
    name: '',
    address: '',
    phone: '',
    currencyId: '',
    status: true
  });
  const [errors, setErrors] = useState<Partial<WarehouseFormData>>({});

  useEffect(() => {
    fetchCurrencies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<WarehouseFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('form.errors.nameRequired');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('form.errors.addressRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('form.errors.phoneRequired');
    }

    if (!formData.currencyId) {
      newErrors.currencyId = t('form.errors.currencyRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WarehouseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación que muestra errores
    const newErrors: Partial<WarehouseFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('form.errors.nameRequired');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('form.errors.addressRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('form.errors.phoneRequired');
    }

    if (!formData.currencyId) {
      newErrors.currencyId = t('form.errors.currencyRequired');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const selectedCurrency = currencies.find(c => c.id === formData.currencyId);
      if (!selectedCurrency) {
        throw new Error('Moneda no encontrada');
      }

      const warehouse = await warehousesService.createWarehouse({
        code: formData.code.trim(),
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        currencyId: selectedCurrency.id,
        currency: selectedCurrency,
        status: formData.status,
        is_open: false
      });

      toastService.success(t('messages.warehouseCreated'));
      
      // Redirigir a la página de aperturas del almacén creado
      router.push(`/${locale}/dashboard/almacenes/aperturas?warehouse_id=${warehouse.id}&warehouse_name=${encodeURIComponent(warehouse.name)}`);
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
    router.push(`/${locale}/dashboard/almacenes/lista-de-almacenes`);
  };

  if (loadingCurrencies) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!can(["warehouse_create"])) {
    return <div>{t("noPermission")}</div>;
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
            {t('newWarehouse')}
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

              {/* Nombre */}
              <div>
                <Input
                  label={t('form.name')}
                  placeholder={t('form.placeholders.name')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <Input
                  label={t('form.phone')}
                  placeholder={t('form.placeholders.phone')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />
              </div>

              {/* Moneda */}
              <div>
                <Select
                  label={t('form.currency')}
                  placeholder={t('currency.selectCurrency')}
                  value={formData.currencyId}
                  onChange={(e) => handleInputChange('currencyId', e.target.value)}
                  error={errors.currencyId}
                  required
                  options={currencies.map(currency => ({
                    value: currency.id,
                    label: `${currency.code} - ${currency.name}`
                  }))}
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <Input
                  label={t('form.address')}
                  placeholder={t('form.placeholders.address')}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                  required
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <Checkbox
                  id="status"
                  checked={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.checked)}
                  label={t('form.active')}
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
              {loading ? 'Creando...' : 'Crear Almacén'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
} 