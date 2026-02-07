"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Expense, ExpenseStatus, ExpenseCategory } from '@/types/expense';
import { expensesService } from '@/services/expenses.service';
import { Btn } from '@/components/atoms';
import { EmptyState } from '@/components/atoms';
import ExportButton from '@/components/atoms/ExportButton';
import AdvancedFilters, { FilterField } from '@/components/atoms/AdvancedFilters';
import BulkActionsBar from '@/components/atoms/BulkActionsBar';
import { useBulkSelection, BulkAction } from '@/hooks/useBulkSelection';
import { toastService } from '@/services/toast.service';
import Drawer from '@/components/Drawer/Drawer';
import ExpenseTable from './ExpenseTable';
import ExpenseForm from './ExpenseForm';
import { ExpenseFormRef } from './ExpenseForm';
import ExpenseFilters from './ExpenseFilters';

export default function ExpenseList() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<ExpenseFormRef>(null);
  
  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    hasSelection,
  } = useBulkSelection(expenses.map(e => ({ ...e, id: e.id.toString() })));
  
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as ExpenseStatus | undefined,
    categoryId: undefined as number | undefined,
    startDate: '',
    endDate: '',
  });

  const t = useTranslations('expenses');
  const tCommon = useTranslations('common');

  useEffect(() => {
    loadExpenses();
  }, [currentPage, filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await expensesService.getExpenses(
        currentPage,
        10,
        filters.search || undefined,
        filters.status,
        filters.categoryId,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setExpenses(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await expensesService.getExpenseCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setShowDrawer(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowDrawer(true);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await expensesService.deleteExpense(expense.id);
        loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingExpense(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    loadExpenses();
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

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: t('bulkDelete'),
      color: 'danger',
      requiresConfirm: true,
      onClick: async () => {
        try {
          await Promise.all(
            selectedIds.map(id => expensesService.deleteExpense(Number(id)))
          );
          toastService.success(t('bulkDeleteSuccess'));
          clearSelection();
          loadExpenses();
        } catch (error) {
          console.error('Error deleting expenses:', error);
          toastService.error(t('bulkDeleteError'));
        }
      },
    },
    {
      id: 'export',
      label: tCommon('actions.export'),
      onClick: async () => {
        // Export handled by ExportButton
      },
    },
  ];

  const advancedFilterFields: FilterField[] = [
    {
      key: 'status',
      label: t('statusLabel'),
      type: 'select',
      options: [
        { value: 'PENDING', label: t('statusPending') },
        { value: 'APPROVED', label: t('statusApproved') },
        { value: 'REJECTED', label: t('statusRejected') },
      ],
    },
    {
      key: 'startDate',
      label: t('startDate'),
      type: 'date',
    },
    {
      key: 'endDate',
      label: t('endDate'),
      type: 'date',
    },
  ];

  const handleAdvancedFilters = (advFilters: any) => {
    setFilters(prev => ({
      ...prev,
      status: advFilters.status as ExpenseStatus | undefined,
      startDate: advFilters.startDate || '',
      endDate: advFilters.endDate || '',
    }));
    setCurrentPage(1);
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
            <>
              <ExportButton
                data={expenses}
                filename="expenses"
                columns={['id', 'description', 'amount', 'date', 'status']}
              />
              <AdvancedFilters
                fields={advancedFilterFields}
                onApply={handleAdvancedFilters}
                storageKey="expense-advanced-filters"
              />
            </>
          )}
          <Btn onClick={handleCreateExpense} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('addExpense')}
          </Btn>
        </div>
      </div>

      {showFilters && (
        <ExpenseFilters
          filters={filters}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !expenses || expenses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            searchTerm={filters.search}
            title="No hay gastos"
            description="Haz clic en 'Nuevo Gasto' para agregar uno."
            searchDescription="No se encontraron gastos con los filtros aplicados"
          />
        </div>
      ) : (
        <div className="mt-6">
          <ExpenseTable
            expenses={expenses}
            categories={categories}
            isLoading={isLoading}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onView={(expenseId) => router.push(`/es/dashboard/finanzas/gastos/${expenseId}`)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            selectedIds={selectedIds}
            onSelectChange={(id) => toggleSelect(id)}
            onSelectAllChange={toggleSelectAll}
          />
        </div>
      )}

      {hasSelection && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClose={clearSelection}
        />
      )}

      <Drawer
        id="expense-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingExpense ? t('editExpense') : t('addExpense')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
        width="max-w-2xl"
      >
        <ExpenseForm
          ref={formRef}
          expense={editingExpense}
          categories={categories}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>
    </div>
  );
}