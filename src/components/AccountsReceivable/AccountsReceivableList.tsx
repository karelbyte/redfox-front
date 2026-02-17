"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AccountReceivable, AccountReceivableStatus, PaymentMethod } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { accountsReceivableService } from '@/services/accounts-receivable.service';
import { clientsService } from '@/services/clients.service';
import { Btn, EmptyState, SearchInput } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import AccountsReceivableTable from './AccountsReceivableTable';
import AccountsReceivableForm from './AccountsReceivableForm';
import { AccountsReceivableFormRef } from './AccountsReceivableForm';
import PaymentDrawer from './PaymentDrawer';
import PaymentHistoryDrawer from './PaymentHistoryDrawer';
import ColumnSelector from '@/components/Table/ColumnSelector';
import AdvancedFilters from '@/components/atoms/AdvancedFilters';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';

export default function AccountsReceivableList() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [accountForPayment, setAccountForPayment] = useState<AccountReceivable | null>(null);
  const [showPaymentHistoryDrawer, setShowPaymentHistoryDrawer] = useState(false);
  const [accountForHistory, setAccountForHistory] = useState<AccountReceivable | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<AccountsReceivableFormRef>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as AccountReceivableStatus | undefined,
    clientId: undefined as number | undefined,
  });

  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

  const availableColumns = [
    { key: 'reference', label: t('table.reference') },
    { key: 'client', label: t('table.client') },
    { key: 'totalAmount', label: t('table.totalAmount') },
    { key: 'remainingAmount', label: t('table.remainingAmount') },
    { key: 'dueDate', label: t('table.dueDate') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'accounts_receivable_table',
    availableColumns.map(c => c.key)
  );

  useEffect(() => {
    loadAccounts();
    loadClients();
  }, [currentPage, filters]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await accountsReceivableService.getAccountsReceivable(
        currentPage,
        10,
        filters.search || undefined,
        filters.status,
        filters.clientId
      );
      setAccounts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading accounts receivable:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await clientsService.getClients();
      setClients(clientsData.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setShowDrawer(true);
  };

  const handleEditAccount = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setShowDrawer(true);
  };

  const handleDeleteAccount = async (account: AccountReceivable) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await accountsReceivableService.deleteAccountReceivable(account.id);
        loadAccounts();
      } catch (error) {
        console.error('Error deleting account receivable:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowDrawer(false);
    setSelectedAccount(null);
    setIsSaving(false);
  };

  const handleModalSuccess = () => {
    loadAccounts();
    handleModalClose();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRegisterPayment = (account: AccountReceivable) => {
    setAccountForPayment(account);
    setShowPaymentDrawer(true);
  };

  const handlePaymentClose = () => {
    setShowPaymentDrawer(false);
    setAccountForPayment(null);
  };

  const handlePaymentSuccess = () => {
    loadAccounts();
    handlePaymentClose();
  };

  const handleViewPayments = async (account: AccountReceivable) => {
    try {
      // Fetch full account details with payments
      const fullAccount = await accountsReceivableService.getAccountReceivable(account.id);
      setAccountForHistory(fullAccount);
      setShowPaymentHistoryDrawer(true);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handlePaymentHistoryClose = () => {
    setShowPaymentHistoryDrawer(false);
    setAccountForHistory(null);
  };

  const handlePaymentSubmit = async (paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => {
    if (!accountForPayment) return;

    try {
      setIsSaving(true);
      await accountsReceivableService.addPayment(accountForPayment.id, paymentData);
      handlePaymentSuccess();
    } catch (error) {
      console.error('Error registering payment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('subtitle', { count: total })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Btn onClick={handleCreateAccount} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('addAccount')}
          </Btn>
        </div>
      </div>

      {/* Filtro de búsqueda y botones */}
      <div className="mt-6 flex gap-4 items-center">
        <div className="flex-1">
          <SearchInput
            placeholder={t('filters.searchPlaceholder')}
            onSearch={(term: string) => {
              setFilters(prev => ({ ...prev, search: term }));
              setCurrentPage(1);
            }}
          />
        </div>

        {accounts && accounts.length > 0 && (
          <>
            <AdvancedFilters
              fields={[
                {
                  key: 'status',
                  label: t('filters.status'),
                  type: 'select',
                  options: [
                    { value: AccountReceivableStatus.PENDING, label: t('status.pending') },
                    { value: AccountReceivableStatus.PARTIAL, label: t('status.partial') },
                    { value: AccountReceivableStatus.PAID, label: t('status.paid') },
                    { value: AccountReceivableStatus.OVERDUE, label: t('status.overdue') },
                    { value: AccountReceivableStatus.CANCELLED, label: t('status.cancelled') },
                  ],
                },
                {
                  key: 'clientId',
                  label: t('filters.client'),
                  type: 'select',
                  options: clients.map(client => ({
                    value: client.id,
                    label: client.name,
                  })),
                },
              ]}
              onApply={(newFilters) => {
                setFilters(prev => ({ ...prev, ...newFilters }));
                setCurrentPage(1);
              }}
              storageKey="accounts-receivable-filters"
            />
            <ColumnSelector
              columns={availableColumns}
              visibleColumns={visibleColumns}
              onChange={toggleColumn}
            />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            searchTerm={filters.search}
            title="No hay cuentas por cobrar"
            description="Haz clic en 'Nueva Cuenta por Cobrar' para agregar una."
            searchDescription="No se encontraron cuentas con los filtros aplicados"
          />
        </div>
      ) : (
        <div className="mt-6">
          <AccountsReceivableTable
            accounts={accounts}
            clients={clients}
            isLoading={isLoading}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            onRegisterPayment={handleRegisterPayment}
            onViewPayments={handleViewPayments}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            visibleColumns={visibleColumns}
          />
        </div>
      )}

      <Drawer
        id="account-receivable-drawer"
        isOpen={showDrawer}
        onClose={handleModalClose}
        title={selectedAccount ? t('editAccount') : t('addAccount')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <AccountsReceivableForm
          ref={formRef}
          account={selectedAccount}
          clients={clients}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Drawer para registrar pago */}
      {accountForPayment && (
        <PaymentDrawer
          account={accountForPayment}
          isOpen={showPaymentDrawer}
          onClose={handlePaymentClose}
          onSubmit={handlePaymentSubmit}
          isSaving={isSaving}
        />
      )}

      {/* Drawer para ver historial de pagos */}
      {accountForHistory && (
        <PaymentHistoryDrawer
          account={accountForHistory}
          isOpen={showPaymentHistoryDrawer}
          onClose={handlePaymentHistoryClose}
        />
      )}
    </div>
  );
}