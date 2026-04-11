'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { quotationService } from '@/services/quotations.service';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import { Quotation, QuotationFormData } from '@/types/quotation';
import { Client } from '@/types/client';
import { Input, SelectWithAdd, TextArea } from '@/components/atoms';
import { SurrogateInput } from '@/components/atoms/SurrogateInput';
import Drawer from '@/components/Drawer/Drawer';
import ClientForm from '@/components/Client/ClientForm';
import { ClientFormRef } from '@/components/Client/ClientForm';

export interface QuotationFormProps {
  quotation: Quotation | null;
  onClose: () => void;
  onSuccess: (id?: string) => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
  /** 'drawer' = single column, 'page' = 2-column grid. Default: 'drawer' */
  layout?: 'drawer' | 'page';
}

export interface QuotationFormRef {
  submit: () => void;
}

interface FormErrors {
  code?: string;
  date?: string;
  valid_until?: string;
  client_id?: string;
}

const QuotationForm = forwardRef<QuotationFormRef, QuotationFormProps>(
  ({ quotation, onSuccess, onSavingChange, onValidChange, layout = 'drawer' }, ref) => {
    const t = useTranslations('pages.quotations');
    const [formData, setFormData] = useState<QuotationFormData>({
      code: '',
      date: '',
      valid_until: '',
      client_id: '',
      notes: '',
    });

    const [clients, setClients] = useState<Client[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [surrogateKey, setSurrogateKey] = useState(0);

    const [showClientDrawer, setShowClientDrawer] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [isClientFormValid, setIsClientFormValid] = useState(false);
    const clientFormRef = useRef<ClientFormRef>(null);

    useEffect(() => {
      loadClients();
    }, []);

    useEffect(() => {
      if (quotation) {
        setFormData({
          code: quotation.code,
          date: quotation.date,
          valid_until: quotation.valid_until || '',
          client_id: quotation.client.id,
          notes: quotation.notes || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        setFormData({
          code: '',
          date: today,
          valid_until: validUntil.toISOString().split('T')[0],
          client_id: '',
          notes: '',
        });
        // Forzar remonte del SurrogateInput para que recargue el código sugerido
        setSurrogateKey(k => k + 1);
      }
    }, [quotation]);

    const loadClients = async () => {
      try {
        const response = await clientsService.getClients();
        setClients(response.data || []);
      } catch (error) {
        console.error('Error loading clients:', error);
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
      if (!formData.client_id) {
        newErrors.client_id = t('form.errors.clientRequired');
      }
      if (formData.valid_until && formData.date && formData.valid_until < formData.date) {
        newErrors.valid_until = t('form.errors.validUntilMustBeAfterDate');
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
      if (!validateForm()) return;

      try {
        onSavingChange?.(true);
        const data = {
          ...formData,
          code: formData.code.trim(),
          notes: formData.notes?.trim() || '',
        };

        if (quotation) {
          await quotationService.updateQuotation(quotation.id, data);
          onSuccess(quotation.id);
        } else {
          const created = await quotationService.createQuotation(data);
          onSuccess(created.id);
        }
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

    const handleClientDrawerClose = () => {
      setShowClientDrawer(false);
      setIsSavingClient(false);
    };

    const handleClientFormSuccess = () => {
      handleClientDrawerClose();
      loadClients();
    };

    const handleClientSave = () => {
      if (clientFormRef.current) {
        clientFormRef.current.submit();
      }
    };

    useImperativeHandle(ref, () => ({ submit: handleSubmit }));

    return (
      <>
        <form className="space-y-6">
          <div className={layout === 'page' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
            <SurrogateInput
              key={quotation ? `edit-${quotation.id}` : `create-${surrogateKey}`}
              label={t('form.code')}
              value={formData.code}
              onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
              surrogateCode="quotation"
              placeholder={t('form.placeholders.code')}
              required
              disabled={!!quotation}
              showSuggestion={!quotation}
              error={errors.code}
            />

            <SelectWithAdd
              id="client"
              label={t('form.client')}
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.code} - ${client.name}`
              }))}
              placeholder={t('form.placeholders.selectClient')}
              required
              error={errors.client_id}
              showAddButton
              onAddClick={() => setShowClientDrawer(true)}
              addButtonTitle={t('actions.createNewClient')}
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

            <Input
              type="date"
              id="valid_until"
              label={t('form.validUntil')}
              value={formData.valid_until}
              onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
              error={errors.valid_until}
            />
          </div>

          <TextArea
            id="notes"
            label={t('form.notes')}
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={t('form.placeholders.notes')}
            rows={3}
          />
        </form>

        <Drawer
          id="client-drawer"
          parentId="quotation-drawer"
          isOpen={showClientDrawer}
          onClose={handleClientDrawerClose}
          title={t('actions.newClient')}
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

QuotationForm.displayName = 'QuotationForm';

export default QuotationForm;
