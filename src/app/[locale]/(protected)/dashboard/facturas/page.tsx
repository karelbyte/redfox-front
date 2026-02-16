"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Invoice } from '@/types/invoice';
import { Client } from '@/types/client';
import { invoiceService, clientsService } from '@/services';
import { toastService } from '@/services/toast.service';
import { Btn } from '@/components/atoms';
import ExportButton from '@/components/atoms/ExportButton';
import AdvancedFilters, { FilterField } from '@/components/atoms/AdvancedFilters';
import Loading from "@/components/Loading/Loading";
import InvoiceTable from '@/components/Invoice/InvoiceTable';
import InvoiceForm from '@/components/Invoice/InvoiceForm';
import DeleteInvoiceModal from '@/components/Invoice/DeleteInvoiceModal';
import GenerateCFDIModal from '@/components/Invoice/GenerateCFDIModal';
import CancelCFDIModal from '@/components/Invoice/CancelCFDIModal';
import Drawer from "@/components/Drawer/Drawer";
import ColumnSelector from '@/components/Table/ColumnSelector';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
export default function InvoicesPage() {
  const t = useTranslations('pages.invoices');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteModal, setDeleteModal] = useState<Invoice | null>(null);
  const [generateCFDIModal, setGenerateCFDIModal] = useState<Invoice | null>(null);
  const [cancelCFDIModal, setCancelCFDIModal] = useState<Invoice | null>(null);
  const [isCFDILoading, setIsCFDILoading] = useState(false);

  // Column visibility management
  const defaultColumns = ['code', 'date', 'client', 'subtotal', 'tax', 'total', 'status', 'actions'];
  const { visibleColumns, toggleColumn } = useColumnPersistence('invoices-table', defaultColumns);
  
  useEffect(() => {
    loadInvoices();
    loadClients();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toastService.error(t('errors.loadInvoices'));
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsService.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toastService.error(t('errors.loadClients'));
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsDrawerOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsDrawerOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setDeleteModal(invoice);
  };

  const handleGenerateCFDI = (invoice: Invoice) => {
    setGenerateCFDIModal(invoice);
  };

  const handleCancelCFDI = (invoice: Invoice) => {
    setCancelCFDIModal(invoice);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    
    try {
      await invoiceService.deleteInvoice(deleteModal.id);
      toastService.success(t('messages.invoiceDeleted'));
      setDeleteModal(null);
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toastService.error(t('errors.deleteInvoice'));
    }
  };

  const handleConfirmGenerateCFDI = async () => {
    if (!generateCFDIModal) return;
    
    try {
      setIsCFDILoading(true);
      await invoiceService.generateCFDI(generateCFDIModal.id);
      toastService.success(t('messages.cfdiGenerated'));
      setGenerateCFDIModal(null);
      loadInvoices();
    } catch (error) {
      console.error('Error generating CFDI:', error);
      toastService.error(t('errors.generateCFDI'));
    } finally {
      setIsCFDILoading(false);
    }
  };

  const handleConfirmCancelCFDI = async (reason: string) => {
    if (!cancelCFDIModal) return;
    
    try {
      setIsCFDILoading(true);
      await invoiceService.cancelCFDI(cancelCFDIModal.id, reason);
      toastService.success(t('messages.cfdiCancelled'));
      setCancelCFDIModal(null);
      loadInvoices();
    } catch (error) {
      console.error('Error cancelling CFDI:', error);
      toastService.error(t('errors.cancelCFDI'));
    } finally {
      setIsCFDILoading(false);
    }
  };

  if (loading) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('title')}
        </h1>
        <Btn
          onClick={handleCreateInvoice}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('actions.createInvoice')}
        </Btn>
      </div>

      {invoices.length > 0 && (
        <div className="mt-6 flex justify-end items-center gap-3">
          <ExportButton
            data={invoices}
            filename="invoices"
            columns={['code', 'date', 'client', 'subtotal', 'tax', 'total', 'status']}
          >
            {t('export')}
          </ExportButton>
          <AdvancedFilters
            fields={[
              {
                key: 'status',
                label: t('table.status'),
                type: 'select',
                options: [
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'SENT', label: 'Sent' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ],
              },
              {
                key: 'date',
                label: t('table.date'),
                type: 'date',
              },
            ]}
            onApply={(filters) => {
              // Apply filters
            }}
            storageKey="invoice-advanced-filters"
          />
          <ColumnSelector
            columns={[
              { key: 'code', label: t('table.code') },
              { key: 'date', label: t('table.date') },
              { key: 'client', label: t('table.client') },
              { key: 'subtotal', label: t('table.subtotal') },
              { key: 'tax', label: t('table.tax') },
              { key: 'total', label: t('table.total') },
              { key: 'status', label: t('table.status') },
              { key: 'actions', label: t('table.actions') },
            ]}
            visibleColumns={visibleColumns}
            onChange={toggleColumn}
          />
        </div>
      )}

      {invoices.length === 0 ? (
        <div 
          className="mt-6 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed"
          style={{ borderColor: `rgb(var(--color-primary-200))` }}
        >
          <svg
            className="h-12 w-12 mb-4"
            style={{ color: `rgb(var(--color-primary-300))` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--color-primary-400))` }}
          >
            {t('empty.title')}
          </p>
          <p 
            className="text-sm"
            style={{ color: `rgb(var(--color-primary-300))` }}
          >
            {t('empty.description')}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <InvoiceTable
            invoices={invoices}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
            onDetails={() => {}}
            onGenerateCFDI={handleGenerateCFDI}
            onCancelCFDI={handleCancelCFDI}
            visibleColumns={visibleColumns}
          />
        </div>
      )}

      <Drawer
        id="invoice-drawer"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingInvoice ? t('drawer.editTitle') : t('drawer.createTitle')}
      >
        <InvoiceForm
          initialData={editingInvoice ? {
            code: editingInvoice.code,
            date: editingInvoice.date,
            client_id: editingInvoice.client.id,
            payment_method: editingInvoice.payment_method,
            payment_conditions: editingInvoice.payment_conditions || '',
            notes: editingInvoice.notes || '',
            details: editingInvoice.details.map(detail => ({
              product_id: detail.product.id,
              quantity: detail.quantity,
              price: detail.price,
              tax_rate: detail.tax_rate
            }))
          } : undefined}
          clients={clients}
          onSuccess={() => {
            setIsDrawerOpen(false);
            loadInvoices();
          }}
          onSavingChange={setIsFormLoading}
        />
      </Drawer>

      <DeleteInvoiceModal
        invoice={deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />

      <GenerateCFDIModal
        invoice={generateCFDIModal}
        onClose={() => setGenerateCFDIModal(null)}
        onConfirm={handleConfirmGenerateCFDI}
        isLoading={isCFDILoading}
      />

      <CancelCFDIModal
        invoice={cancelCFDIModal}
        onClose={() => setCancelCFDIModal(null)}
        onConfirm={handleConfirmCancelCFDI}
        isLoading={isCFDILoading}
      />
    </div>
  );
}
