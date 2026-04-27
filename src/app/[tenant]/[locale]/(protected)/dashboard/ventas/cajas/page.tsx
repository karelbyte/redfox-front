'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { cashRegisterService } from '@/services/cash-register.service';
import { toastService } from '@/services/toast.service';
import { CashRegister } from '@/types/cash-register';
import CashRegisterForm from '@/components/CashRegister/CashRegisterForm';
import CashRegisterTable from '@/components/CashRegister/CashRegisterTable';
import DeleteCashRegisterModal from '@/components/CashRegister/DeleteCashRegisterModal';
import Pagination from '@/components/Pagination/Pagination';
import Drawer from '@/components/Drawer/Drawer';
import { CashRegisterFormRef } from '@/components/CashRegister/CashRegisterForm';
import Loading from '@/components/Loading/Loading';
import { Btn, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { useColumnPersistence } from '@/hooks/useColumnPersistence';
import ColumnSelector from '@/components/Table/ColumnSelector';
import HelpButton from '@/components/Help/HelpButton';
import { cashRegistersHelp } from '@/components/Help/configs/cash-registers.help';

export default function CashRegistersPage() {
  const t = useTranslations('pages.cashRegisters');
  const { can } = usePermissions();
  const locale = useLocale();
  const { tenant } = useParams();

  const getLocalizedPath = useCallback((path: string) => `/${tenant}/${locale}${path}`, [tenant, locale]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCashRegister, setEditingCashRegister] = useState<CashRegister | null>(null);
  const [cashRegisterToDelete, setCashRegisterToDelete] = useState<CashRegister | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<CashRegisterFormRef>(null);
  const initialFetchDone = useRef(false);

  const availableColumns = [
    { key: 'code', label: t('table.code') },
    { key: 'name', label: t('table.name') },
    { key: 'current_amount', label: t('table.currentAmount') },
    { key: 'status', label: t('table.status') },
    { key: 'openedAt', label: t('table.openedAt') },
    { key: 'openedBy', label: t('table.openedBy') },
    { key: 'actions', label: t('table.actions') },
  ];

  const { visibleColumns, toggleColumn } = useColumnPersistence(
    'cash_registers_table',
    availableColumns.map((c) => c.key)
  );

  const fetchCashRegisters = async (page: number) => {
    try {
      setLoading(true);
      const response = await cashRegisterService.getCashRegisters(page);
      setCashRegisters(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch {
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCashRegisters(currentPage);
    }
  }, []);

  const handleDelete = async () => {
    if (!cashRegisterToDelete) return;

    try {
      await cashRegisterService.deleteCashRegister(cashRegisterToDelete.id);
      toastService.success(t('messages.cashRegisterDeleted'));
      fetchCashRegisters(currentPage);
      setCashRegisterToDelete(null);
    } catch {
      toastService.error(t('messages.errorDeleting'));
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setEditingCashRegister(cashRegister);
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingCashRegister(null);
    setIsSaving(false);
  };

  const handleSave = async () => {
    if (!formRef.current) return;

    try {
      setIsSaving(true);
      const formData = formRef.current.getFormData();

      if (editingCashRegister) {
        await cashRegisterService.updateCashRegister(editingCashRegister.id, formData);
        toastService.success(t('messages.cashRegisterUpdated'));
      } else {
        await cashRegisterService.openCashRegister(formData.initial_amount, formData.name, formData.description);
        toastService.success(t('messages.cashRegisterCreated'));
      }

      handleDrawerClose();
      fetchCashRegisters(currentPage);
    } catch {
      toastService.error(editingCashRegister ? t('messages.errorUpdating') : t('messages.errorCreating'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormValidityChange = (valid: boolean) => {
    setIsFormValid(valid);
  };

  const handleView = (cashRegister: CashRegister) => {
    window.location.href = getLocalizedPath(`/dashboard/ventas/cajas/${cashRegister.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-semibold"
            style={{ color: 'rgb(var(--color-primary-800))' }}
          >
            {t('title')}
          </h1>
          <HelpButton config={cashRegistersHelp} />
        </div>
        {can(['cash_registers_create']) && (
          <Btn
            onClick={() => {
              setEditingCashRegister(null);
              setShowDrawer(true);
            }}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('actions.create')}
          </Btn>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : cashRegisters && cashRegisters.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
        />
      ) : (
        <>
          <div className="my-6 flex justify-end">
            <ColumnSelector
              columns={availableColumns}
              visibleColumns={visibleColumns}
              onChange={toggleColumn}
            />
          </div>
          <CashRegisterTable
            cashRegisters={cashRegisters}
            visibleColumns={visibleColumns}
            onEdit={can(['cash_registers_update']) ? handleEdit : undefined}
            onDelete={can(['cash_registers_delete']) ? setCashRegisterToDelete : undefined}
            onView={handleView}
          />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      <Drawer
        id="cash-register-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingCashRegister ? t('actions.edit') : t('actions.create')}
      >
        <CashRegisterForm
          ref={formRef}
          cashRegister={editingCashRegister}
          onValidityChange={handleFormValidityChange}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Btn variant="secondary" onClick={handleDrawerClose}>
            {t('actions.cancel')}
          </Btn>
          <Btn
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            loading={isSaving}
          >
            {editingCashRegister ? t('actions.save') : t('actions.create')}
          </Btn>
        </div>
      </Drawer>

      <DeleteCashRegisterModal
        onClose={() => setCashRegisterToDelete(null)}
        onConfirm={handleDelete}
        cashRegister={cashRegisterToDelete}
      />
    </div>
  );
}
