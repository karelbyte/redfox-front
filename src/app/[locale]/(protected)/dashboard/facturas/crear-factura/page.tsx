"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Loading from "@/components/Loading/Loading";
import { InvoiceFormData, Client,} from '@/types/invoice';
import { invoiceService } from '@/services';
import { toastService } from '@/services/toast.service';
import Drawer from "@/components/Drawer/Drawer";
import InvoiceForm from '@/components/Invoice/InvoiceForm';

export default function CreateInvoicePage() {
  const t = useTranslations('pages.invoices');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  const drawerRef = useRef<{ openDrawer: () => void; closeDrawer: () => void }>(null);

  useEffect(() => {
    loadClients();
    drawerRef.current?.openDrawer();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toastService.error(t('errors.loadClients'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: InvoiceFormData) => {
    try {
      setIsFormLoading(true);
      await invoiceService.createInvoice(formData);
      toastService.success(t('messages.invoiceCreated'));
      drawerRef.current?.closeDrawer();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toastService.error(t('errors.createInvoice'));
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    window.history.back();
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('create.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('create.subtitle')}</p>
        </div>
      </div>

      <Drawer
        ref={drawerRef}
        title={t('drawer.createTitle')}
        onClose={() => window.history.back()}
      >
        <InvoiceForm
          clients={clients}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isFormLoading}
        />
      </Drawer>
    </div>
  );
}
