'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, BanknotesIcon, CreditCardIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { SaleFormData, PaymentMethod, CardType } from '@/types/sale';
import { Client } from '@/types/client';
import { Btn, Input, SelectWithAdd } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';

export default function AddSalePage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const tenant = params?.tenant as string;
  const t = useTranslations('pages.sales');
  const tCommon = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<SaleFormData>({
    code: '',
    destination: '',
    client_id: '',
    amount: 0,
    type: 'WITHDRAWAL',
    payment_method: PaymentMethod.CASH,
    card_type: null,
  });
  const [cardType, setCardType] = useState<CardType | null>(null);
  const [errors, setErrors] = useState<{ code?: string; destination?: string; client_id?: string }>({});

  // Drawer de clientes
  const [showClientDrawer, setShowClientDrawer] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isClientFormValid, setIsClientFormValid] = useState(false);
  const clientFormRef = useRef<ClientFormRef>(null);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch {
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoadingClients(false);
    }
  };

  const set = (field: keyof SaleFormData, value: string | number | PaymentMethod) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const e: { code?: string; destination?: string; client_id?: string } = {};
    if (!formData.code.trim()) e.code = t('form.errors.codeRequired');
    if (!formData.destination.trim()) e.destination = t('form.errors.destinationRequired');
    if (!formData.client_id) e.client_id = t('form.errors.clientRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const sale = await saleService.createSale({
        code: formData.code.trim(),
        destination: formData.destination.trim(),
        client_id: formData.client_id,
        amount: formData.amount,
        type: formData.type,
        payment_method: formData.payment_method,
        card_type: cardType,
      });
      toastService.success(t('messages.saleCreated'));
      router.push(`/${tenant}/${locale}/dashboard/ventas/ventas/${sale.id}`);
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t('messages.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  if (loadingClients) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Btn
          variant="ghost"
          onClick={() => router.push(`/${tenant}/${locale}/dashboard/ventas`)}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          {tCommon('actions.back')}
        </Btn>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('newSale')}
          </h1>
          <p className="text-sm text-gray-500">{t('form.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('form.title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <Input
              label={t('form.code')}
              placeholder={t('form.placeholders.code')}
              value={formData.code}
              onChange={(e) => set('code', e.target.value)}
              error={errors.code}
              required
            />

            {/* Cliente */}
            <SelectWithAdd
              id="client"
              label={t('form.client')}
              placeholder={t('form.placeholders.selectClient')}
              value={formData.client_id}
              onChange={(e) => set('client_id', e.target.value)}
              error={errors.client_id}
              required
              options={clients.map(c => ({ value: c.id, label: c.name }))}
              showAddButton
              onAddClick={() => setShowClientDrawer(true)}
              addButtonTitle={t('actions.createNewClient')}
            />
          </div>

          {/* Destino */}
          <Input
            label={t('form.destination')}
            placeholder={t('form.placeholders.destination')}
            value={formData.destination}
            onChange={(e) => set('destination', e.target.value)}
            error={errors.destination}
            required
          />

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.paymentMethod')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.CASH}
                  checked={formData.payment_method === PaymentMethod.CASH}
                  onChange={() => set('payment_method', PaymentMethod.CASH)}
                />
                <BanknotesIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.paymentMethods.cash')}</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={formData.payment_method === PaymentMethod.CARD && cardType === CardType.CREDIT}
                  onChange={() => {
                    set('payment_method', PaymentMethod.CARD);
                    setCardType(CardType.CREDIT);
                  }}
                />
                <CreditCardIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.cardTypes.credit')}</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={formData.payment_method === PaymentMethod.CARD && cardType === CardType.DEBIT}
                  onChange={() => {
                    set('payment_method', PaymentMethod.CARD);
                    setCardType(CardType.DEBIT);
                  }}
                />
                <CreditCardIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.cardTypes.debit')}</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.TRANSFER}
                  checked={formData.payment_method === PaymentMethod.TRANSFER}
                  onChange={() => {
                    set('payment_method', PaymentMethod.TRANSFER);
                    setCardType(null);
                  }}
                />
                <ArrowPathIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.paymentMethods.transfer')}</span>
              </label>

              {selectedClient?.credit?.is_active && (
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={PaymentMethod.CREDIT}
                    checked={formData.payment_method === PaymentMethod.CREDIT}
                    onChange={() => set('payment_method', PaymentMethod.CREDIT)}
                  />
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm block">{t('form.paymentMethods.credit')}</span>
                    <span className="text-xs text-gray-400">
                      {t('form.paymentMethods.creditLimit')}: ${selectedClient.credit.credit_limit.toFixed(2)} | {selectedClient.credit.credit_days} {t('form.paymentMethods.days')}
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <Btn
            variant="outline"
            type="button"
            onClick={() => router.push(`/${tenant}/${locale}/dashboard/ventas`)}
          >
            {tCommon('actions.cancel')}
          </Btn>
          <Btn type="submit" loading={loading} disabled={loading}>
            {loading ? tCommon('actions.saving') : t('actions.create')}
          </Btn>
        </div>
      </form>

      {/* Drawer para crear clientes */}
      <Drawer
        id="client-drawer"
        isOpen={showClientDrawer}
        onClose={() => { setShowClientDrawer(false); setIsSavingClient(false); }}
        title={t('actions.newClient')}
        onSave={() => clientFormRef.current?.submit()}
        isSaving={isSavingClient}
        isFormValid={isClientFormValid}
      >
        <ClientForm
          ref={clientFormRef}
          client={null}
          onClose={() => { setShowClientDrawer(false); setIsSavingClient(false); }}
          onSuccess={() => { setShowClientDrawer(false); fetchClients(); }}
          onSavingChange={setIsSavingClient}
          onValidChange={setIsClientFormValid}
        />
      </Drawer>
    </div>
  );
}
