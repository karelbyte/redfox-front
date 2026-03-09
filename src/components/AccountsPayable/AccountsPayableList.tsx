'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';
import { accountsPayableService } from '@/services/accounts-payable.service';
import { toastService } from '@/services/toast.service';
import { Btn, EmptyState, SearchInput } from '@/components/atoms';
import ExportButton from '@/components/atoms/ExportButton';
import AdvancedFilters, { FilterField } from '@/components/atoms/AdvancedFilters';
import Drawer from '@/components/Drawer/Drawer';
import AccountsPayableTable from './AccountsPayableTable';
import AccountsPayableForm, { AccountsPayableFormRef } from './AccountsPayableForm';
import PaymentDrawer from './PaymentDrawer';
import Loading from '@/components/Loading/Loading';
import ColumnSelector from '@/components/Table/ColumnSelector';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import ConfirmModal from '@/components/Modal/ConfirmModal';

export default function AccountsPayableList() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('accountsPayable');
  const tCommon = useTranslations('common');

  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountPayable | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    status: undefined as AccountPayableStatus | undefined,
    startDate: '',
    endDate: '',
  });

  const formRef = useRef<AccountsPayableFormRef>(null);

  const availableColumns = [
    { key: 'referenceNumber', label: t('table.referenceNumber') },
    { key: 'provider', label: t('table.provider') },
    { key: 'totalAmount', label: t('table.totalAmount') },
    { key: 'remainingAmount', label: t('table.remainingAmount') },
    { key: 'dueDate', label: t('table.dueDate') },
    { key: 'status', label: t('table.status') },
    { key: 'actions', label: t('table.actions_title') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'accounts_payable_table',
    availableColumns.map(c => c.key)
  );

  useEffect(() => {
    loadAccounts();
  }, [page, filters]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await accountsPayableService.getAccountsPayable(
        page,
        10,
        filters.search || undefined,
        filters.status,
        undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setAccounts(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading accounts payable:', error);
      toastService.error(t('messages.errorLoading'));
      setAccounts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDrawer = (account?: AccountPayable) => {
    setSelectedAccount(account || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAccount(null);
    formRef.current?.reset();
  };

  const handleSave = async () => {
    formRef.current?.submit();
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    setPage(1);
    loadAccounts();
  };

  const handleDelete = (account: AccountPayable) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await accountsPayableService.deleteAccountPayable(accountToDelete.id);
      toastService.success(t('messages.accountDeleted'));
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toastService.error(t('messages.errorDeleting'));
    } finally {
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleRegisterPayment = (account: AccountPayable) => {
    setSelectedAccount(account);
    setIsPaymentDrawerOpen(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedAccount) return;

    try {
      setIsPaymentSaving(true);
      await accountsPayableService.addPayment(selectedAccount.id, paymentData);
      toastService.success(tCommon('messages.successCreated', { item: t('registerPayment') }));
      setIsPaymentDrawerOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error registering payment:', error);
      toastService.error(tCommon('messages.errorCreating', { item: t('registerPayment') }));
    } finally {
      setIsPaymentSaving(false);
    }
  };

  const handleViewPayments = (account: AccountPayable) => {
    router.push(`/${locale}/dashboard/finanzas/cuentas-por-pagar/${account.id}`);
  };

  const handleAdvancedFilters = (advFilters: any) => {
    setFilters(prev => ({
      ...prev,
      status: advFilters.status as AccountPayableStatus | undefined,
      startDate: advFilters.startDate || '',
      endDate: advFilters.endDate || '',
    }));
    setPage(1);
  };

  const advancedFilterFields: FilterField[] = [
    {
      key: 'status',
      label: t('filters.status'),
      type: 'select',
      options: [
        { value: 'pending', label: t('status.pending') },
        { value: 'partial', label: t('status.partial') },
        { value: 'paid', label: t('status.paid') },
        { value: 'overdue', label: t('status.overdue') },
        { value: 'cancelled', label: t('status.cancelled') },
      ],
    },
    {
      key: 'startDate',
      label: t('filters.startDate'),
      type: 'date',
    },
    {
      key: 'endDate',
      label: t('filters.endDate'),
      type: 'date',
    },
  ];

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
          <Btn
            onClick={() => handleOpenDrawer()}
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('actions.create')}
          </Btn>
        </div>
      </div>

      {(total > 0 || filters.search) && (
        <div className="mt-6 flex gap-4 items-center">
          <div className="flex-1">
            <SearchInput
              placeholder={t('filters.searchPlaceholder')}
              onSearch={(term) => {
                setFilters(prev => ({ ...prev, search: term }));
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center space-x-3">
            <ExportButton
              data={accounts}
              filename="accounts-payable"
              columns={['referenceNumber', 'provider', 'totalAmount', 'remainingAmount', 'dueDate', 'status']}
            >
            </ExportButton>
            <AdvancedFilters
              fields={advancedFilterFields}
              onApply={handleAdvancedFilters}
              storageKey="accounts-payable-advanced-filters"
            />
            <ColumnSelector
              columns={availableColumns}
              visibleColumns={visibleColumns}
              onChange={toggleColumn}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64 mt-6">
          <Loading size="lg" />
        </div>
      ) : !accounts || (accounts.length === 0 && !filters.search) ? (
        <div className="mt-6">
          <EmptyState
            searchTerm={filters.search}
            title={t('empty.title')}
            description={t('empty.description')}
            searchDescription={t('empty.description')}
          />
        </div>
      ) : accounts.length === 0 && filters.search ? (
        <div className="mt-6">
          <EmptyState
            searchTerm={filters.search}
            title={t('empty.title')}
            description={t('empty.description')}
            searchDescription={t('messages.noResults')}
          />
        </div>
      ) : (
        <div className="mt-6">
          <AccountsPayableTable
            accounts={accounts}
            isLoading={isLoading}
            onEdit={handleOpenDrawer}
            onDelete={handleDelete}
            onRegisterPayment={handleRegisterPayment}
            onViewPayments={handleViewPayments}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            visibleColumns={visibleColumns}
          />
        </div>
      )}

      <Drawer
        id="accounts-payable-drawer"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={selectedAccount ? t('drawer.editTitle') : t('drawer.createTitle')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <AccountsPayableForm
          ref={formRef}
          account={selectedAccount}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {selectedAccount && (
        <PaymentDrawer
          account={selectedAccount}
          isOpen={isPaymentDrawerOpen}
          onClose={() => {
            setIsPaymentDrawerOpen(false);
            setSelectedAccount(null);
          }}
          onSubmit={handlePaymentSubmit}
          isSaving={isPaymentSaving}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('messages.confirmDeleteTitle')}
        message={t('messages.confirmDelete')}
        confirmText={tCommon('actions.delete')}
        cancelText={tCommon('actions.cancel')}
      />
    </div>
  );
}
