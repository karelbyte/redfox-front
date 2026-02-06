"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';
import { accountsPayableService } from '@/services/accounts-payable.service';
import { toastService } from '@/services/toast.service';
import Drawer from '@/components/Drawer/Drawer';
import AccountsPayableTable from './AccountsPayableTable';
import AccountsPayableFilters from './AccountsPayableFilters';
import AccountsPayableForm, { AccountsPayableFormRef } from './AccountsPayableForm';
import { Btn, EmptyState } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';

export default function AccountsPayableList() {
  const t = useTranslations('accountsPayable');
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '' as AccountPayableStatus | '',
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
        filters.status || undefined,
        undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setAccounts(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading accounts payable:', error);
      toastService.error(t('messages.errorLoading'));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('title')} {total > 0 && `(${total})`}
        </h2>
        <Btn
          onClick={() => handleOpenDrawer()}
          variant="primary"
        >
          {t('actions.create')}
        </Btn>
      </div>

      {total > 0 && (
        <AccountsPayableFilters
          onSearch={(search) => handleFilterChange({ ...filters, search })}
          onStatusChange={(status) => handleFilterChange({ ...filters, status })}
          onDateRangeChange={(startDate, endDate) =>
            handleFilterChange({ ...filters, startDate, endDate })
          }
        />
      )}

      {isLoading ? (
        <Loading />
      ) : total === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
        />
      ) : (
        <AccountsPayableTable
          accounts={accounts}
          isLoading={isLoading}
          onEdit={handleOpenDrawer}
          onDelete={handleDelete}
        />
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
