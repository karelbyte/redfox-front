"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';
import { accountsPayableService } from '@/services/accounts-payable.service';
import { toastService } from '@/services/toast.service';
import { Btn, EmptyState } from '@/components/atoms';
import ExportButton from '@/components/atoms/ExportButton';
import AdvancedFilters, { FilterField } from '@/components/atoms/AdvancedFilters';
import Drawer from '@/components/Drawer/Drawer';
import AccountsPayableTable from './AccountsPayableTable';
import AccountsPayableForm, { AccountsPayableFormRef } from './AccountsPayableForm';
import Loading from '@/components/Loading/Loading';

export default function AccountsPayableList() {
  const t = useTranslations('accountsPayable');
  const tCommon = useTranslations('common');
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as AccountPayableStatus | undefined,
    startDate: '',
    endDate: '',
  });

  const formRef = useRef<AccountsPayableFormRef>(null);

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

  const handleDelete = async (account: AccountPayable) => {
    if (!confirm(t('messages.confirmDelete'))) {
      return;
    }

    try {
      await accountsPayableService.deleteAccountPayable(account.id);
      toastService.success(t('messages.accountDeleted'));
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toastService.error(t('messages.errorDeleting'));
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {total > 0 && (
            <>
              <ExportButton
                data={accounts}
                filename="accounts-payable"
                columns={['referenceNumber', 'provider', 'totalAmount', 'remainingAmount', 'dueDate', 'status']}
              >
                {tCommon('actions.export')}
              </ExportButton>
              <AdvancedFilters
                fields={advancedFilterFields}
                onApply={handleAdvancedFilters}
                storageKey="accounts-payable-advanced-filters"
              />
            </>
          )}
          <Btn 
            onClick={() => handleOpenDrawer()} 
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('actions.create')}
          </Btn>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            searchTerm={filters.search}
            title={t('empty.title')}
            description={t('empty.description')}
            searchDescription={t('empty.description')}
          />
        </div>
      ) : (
        <div className="mt-6">
          <AccountsPayableTable
            accounts={accounts}
            isLoading={isLoading}
            onEdit={handleOpenDrawer}
            onDelete={handleDelete}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
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
    </div>
  );
}
