"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Loading from "@/components/Loading/Loading";
import { Client } from '@/types/invoice';
import { clientsService } from '@/services/clients.service';
import { toastService } from '@/services/toast.service';
import InvoiceForm, { InvoiceFormRef } from '@/components/Invoice/InvoiceForm';
import { Btn } from '@/components/atoms';
import { usePermissions } from '@/hooks/usePermissions';

export default function CreateInvoicePage() {
  const t = useTranslations('pages.invoices');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const { can } = usePermissions();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const formRef = useRef<InvoiceFormRef>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toastService.error(t('messages.errorLoadingClients'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleSuccess = () => {
    toastService.success(t('messages.invoiceCreated'));
    if (formRef.current) {
      formRef.current.reset();
    }
    // Opcional: redirigir a la lista de facturas
    // router.push(`/${locale}/dashboard/facturas`);
  };

  const handleBack = () => {
    router.push(`/${locale}/dashboard/facturas`);
  };

  if (!can(["invoice_create"])) {
    return <div>{t('noPermissionDesc')}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: `rgb(var(--color-primary-800))` }}
            >
              {t('create.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('create.subtitle')}
            </p>
          </div>
        </div>
        <Btn
          onClick={handleSave}
          disabled={!isFormValid}
          loading={isSaving}
        >
          {tCommon('actions.save')}
        </Btn>
      </div>

      <div className="max-w-4xl">
        <InvoiceForm
          ref={formRef}
          clients={clients}
          onSuccess={handleSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </div>
    </div>
  );
}
