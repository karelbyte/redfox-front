'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { SaleFormData } from '@/types/sale';
import { Client } from '@/types/client';
import { Btn, Input, SelectWithAdd } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';

export default function AddSalePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.sales');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<SaleFormData>({
    code: '',
    destination: '',
    client_id: '',
    amount: 0,
    type: 'WITHDRAWAL'
  });
  const [errors, setErrors] = useState<Partial<SaleFormData>>({});

  // Estados para el drawer de clientes
  const [showClientDrawer, setShowClientDrawer] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isClientFormValid, setIsClientFormValid] = useState(false);
  const clientFormRef = useRef<ClientFormRef>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch {
      toastService.error('Error al cargar clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SaleFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.destination.trim()) {
      newErrors.destination = t('form.errors.destinationRequired');
    }

    if (!formData.client_id) {
      newErrors.client_id = t('form.errors.clientRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SaleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación que muestra errores
    const newErrors: Partial<SaleFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.destination.trim()) {
      newErrors.destination = t('form.errors.destinationRequired');
    }

    if (!formData.client_id) {
      newErrors.client_id = t('form.errors.clientRequired');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const sale = await saleService.createSale({
        code: formData.code.trim(),
        destination: formData.destination.trim(),
        client_id: formData.client_id,
        amount: formData.amount,
        type: formData.type
      });

      toastService.success(t('messages.saleCreated'));
      
      // Redirigir a la página de detalles de la venta creada
      router.push(`/${locale}/dashboard/ventas/ventas/${sale.id}`);
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
    router.push(`/${locale}/dashboard/ventas`);
  };

  // Handlers para el drawer de clientes
  const handleClientDrawerClose = () => {
    setShowClientDrawer(false);
    setIsSavingClient(false);
  };

  const handleClientFormSuccess = () => {
    handleClientDrawerClose();
    fetchClients(); // Recargar clientes
  };

  const handleClientSave = () => {
    if (clientFormRef.current) {
      clientFormRef.current.submit();
    }
  };

  if (loadingClients) {
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
            {t('newSale')}
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

              {/* Cliente */}
              <div>
                <SelectWithAdd
                  id="client"
                  label={t('form.client')}
                  placeholder="Seleccione un cliente"
                  value={formData.client_id}
                  onChange={(e) => handleInputChange('client_id', e.target.value)}
                  error={errors.client_id}
                  required
                  options={clients.map((client) => ({
                    value: client.id,
                    label: client.name
                  }))}
                  showAddButton
                  onAddClick={() => setShowClientDrawer(true)}
                  addButtonTitle={t('actions.createNewClient')}
                />
              </div>

              {/* Destino */}
              <div className="md:col-span-2">
                <Input
                  label={t('form.destination')}
                  placeholder={t('form.placeholders.destination')}
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  error={errors.destination}
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
              {loading ? 'Creando...' : 'Crear Venta'}
            </Btn>
          </div>
        </form>
      </div>

      {/* Drawer para crear clientes */}
      <Drawer
        id="client-drawer"
        isOpen={showClientDrawer}
        onClose={handleClientDrawerClose}
        title="Nuevo Cliente"
        onSave={handleClientSave}
        isSaving={isSavingClient}
        isFormValid={isClientFormValid}
      >
        <ClientForm
          ref={clientFormRef}
          client={null}
          onClose={handleClientDrawerClose}
          onSuccess={handleClientFormSuccess}
          onSavingChange={setIsSavingClient}
          onValidChange={setIsClientFormValid}
        />
      </Drawer>
    </div>
  );
} 