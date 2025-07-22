'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { saleService } from '@/services/sales.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { Sale, SaleFormData } from '@/types/sale';
import { Client } from '@/types/client';
import { Input, SelectWithAdd } from '@/components/atoms';
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
        });
      } else {
        setFormData({
          code: '',
          type: 'WITHDRAWAL',
          destination: '',
          client_id: '',
          amount: 0,
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

      if (!formData.destination.trim()) {
        newErrors.destination = t('form.errors.destinationRequired');
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

          <Input
            type="text"
            id="destination"
            label={t('form.destination')}
            required
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            placeholder={t('form.placeholders.destination')}
            error={errors.destination}
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