'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { Sale, SaleFormData, PaymentMethod, CardType } from '@/types/sale';
import { Client } from '@/types/client';
import { Input, SelectWithAdd } from '@/components/atoms';
import { BanknotesIcon, CreditCardIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';

export interface SaleFormProps {
  sale: Sale | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface SaleFormRef {
  submit: () => void;
}

interface FormErrors {
  code?: string;
  destination?: string;
  client_id?: string;
}

const SaleForm = forwardRef<SaleFormRef, SaleFormProps>(
  ({ sale, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.sales');
    const [formData, setFormData] = useState<SaleFormData>({
      code: '',
      destination: '',
      type: 'WITHDRAWAL',
      client_id: '',
      amount: 0,
      payment_method: PaymentMethod.CASH,
      card_type: null,
    });

    const [clients, setClients] = useState<Client[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    // Estados para el drawer de clientes
    const [showClientDrawer, setShowClientDrawer] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [isClientFormValid, setIsClientFormValid] = useState(false);
    const clientFormRef = useRef<ClientFormRef>(null);

    useEffect(() => {
      loadClients();
    }, []);

    useEffect(() => {
      if (sale) {
        setFormData({
          code: sale.code,
          type: 'WITHDRAWAL',
          destination: sale.destination,
          client_id: sale.client.id,
          amount: parseFloat(sale.amount),
          payment_method: sale.payment_method || PaymentMethod.CASH,
          card_type: sale.card_type || null,
        });
      } else {
        setFormData({
          code: '',
          type: 'WITHDRAWAL',
          destination: '',
          client_id: '',
          amount: 0,
          payment_method: PaymentMethod.CASH,
          card_type: null,
        });
      }
    }, [sale]);

    const loadClients = async () => {
      try {
        const response = await clientsService.getClients();
        setClients(response.data || []);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.code.trim()) {
        newErrors.code = t('form.errors.codeRequired');
      }

      if (!formData.client_id) {
        newErrors.client_id = t('form.errors.clientRequired');
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
          destination: formData.destination.trim(),
        };

        if (sale) {
          await saleService.updateSale(sale.id, data);
        } else {
          await saleService.createSale(data);
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

    // Handlers para el drawer de clientes
    const handleClientDrawerClose = () => {
      setShowClientDrawer(false);
      setIsSavingClient(false);
    };

    const handleClientFormSuccess = () => {
      handleClientDrawerClose();
      loadClients(); // Recargar clientes
    };

    const handleClientSave = () => {
      if (clientFormRef.current) {
        clientFormRef.current.submit();
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

          <SelectWithAdd
            id="client"
            label={t('form.client')}
            value={formData.client_id}
            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            options={clients.map((client) => ({
              value: client.id,
              label: `${client.name}`
            }))}
            placeholder="Seleccione un cliente"
            required
            error={errors.client_id}
            showAddButton
            onAddClick={() => setShowClientDrawer(true)}
            addButtonTitle={t('actions.createNewClient')}
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
                  onChange={() => setFormData(prev => ({ ...prev, payment_method: PaymentMethod.CASH }))}
                />
                <BanknotesIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.paymentMethods.cash')}</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={formData.payment_method === PaymentMethod.CARD && formData.card_type === CardType.CREDIT}
                  onChange={() => setFormData(prev => ({ ...prev, payment_method: PaymentMethod.CARD, card_type: CardType.CREDIT }))}
                />
                <CreditCardIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.cardTypes.credit')}</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.CARD}
                  checked={formData.payment_method === PaymentMethod.CARD && formData.card_type === CardType.DEBIT}
                  onChange={() => setFormData(prev => ({ ...prev, payment_method: PaymentMethod.CARD, card_type: CardType.DEBIT }))}
                />
                <CreditCardIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.cardTypes.debit')}</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={PaymentMethod.TRANSFER}
                  checked={formData.payment_method === PaymentMethod.TRANSFER}
                  onChange={() => setFormData(prev => ({ ...prev, payment_method: PaymentMethod.TRANSFER, card_type: null }))}
                />
                <ArrowPathIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{t('form.paymentMethods.transfer')}</span>
              </label>
              {(() => {
                const selectedClient = clients.find(c => c.id === formData.client_id);
                return selectedClient?.credit?.is_active ? (
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={PaymentMethod.CREDIT}
                      checked={formData.payment_method === PaymentMethod.CREDIT}
                      onChange={() => setFormData(prev => ({ ...prev, payment_method: PaymentMethod.CREDIT }))}
                    />
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm block">{t('form.paymentMethods.credit')}</span>
                      <span className="text-xs text-gray-400">
                        {t('form.paymentMethods.creditLimit')}: ${selectedClient.credit.credit_limit.toFixed(2)} | {selectedClient.credit.credit_days} {t('form.paymentMethods.days')}
                      </span>
                    </div>
                  </label>
                ) : null;
              })()}
            </div>
          </div>

          <Input
            type="text"
            id="destination"
            label={t('form.destination')}
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            placeholder={t('form.placeholders.destination')}
          />
        </form>

        {/* Drawer para crear clientes */}
        <Drawer
          id="client-drawer"
          parentId="sale-drawer"
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
      </>
    );
  }
);

SaleForm.displayName = 'SaleForm';

export default SaleForm; 