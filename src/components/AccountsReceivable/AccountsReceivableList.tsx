"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { AccountReceivable, AccountReceivableStatus } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { accountsReceivableService } from '@/services/accounts-receivable.service';
import { clientsService } from '@/services/clients.service';
import { Btn, EmptyState } from '@/components/atoms';
import Drawer from '@/components/Drawer/Drawer';
import AccountsReceivableTable from './AccountsReceivableTable';
import AccountsReceivableForm from './AccountsReceivableForm';
import { AccountsReceivableFormRef } from './AccountsReceivableForm';
import AccountsReceivableFilters from './AccountsReceivableFilters';

export default function AccountsReceivableList() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
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
    startDate: '',
    endDate: '',
  });

  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

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
        filters.clientId,
        filters.startDate || undefined,
        filters.endDate || undefined
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

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          {total > 0 && (
            <Btn
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              {tCommon('actions.filters')}
            </Btn>
          )}
          <Btn onClick={handleCreateAccount} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('addAccount')}
          </Btn>
        </div>
      </div>

      {showFilters && (
        <AccountsReceivableFilters
          filters={filters}
          clients={clients}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
    </div>
  );
}