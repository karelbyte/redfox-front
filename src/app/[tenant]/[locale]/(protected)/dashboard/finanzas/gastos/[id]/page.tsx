"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Expense, ExpenseCategory } from '@/types/expense';
import { expensesService } from '@/services/expenses.service';
import { Btn } from '@/components/atoms';
import BookmarkButton from '@/components/atoms/BookmarkButton';
import AuditHistory from '@/components/atoms/AuditHistory';
import InternalNotesDrawer from '@/components/atoms/InternalNotesDrawer';
import InternalNotesList from '@/components/atoms/InternalNotesList';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  const t = useTranslations('expenses');
  const tCommon = useTranslations('common');

  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

  useEffect(() => {
    loadExpense();
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      setIsLoading(true);
      const response = await expensesService.getExpenses(1, 100);
      const found = response.data?.find(e => e.id === Number(expenseId));
      setExpense(found || null);
    } catch (error) {
      console.error('Error loading expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <Btn onClick={() => router.back()} variant="outline">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {tCommon('actions.back')}
        </Btn>
        <div className="mt-6 text-center text-gray-500">
          {t('notFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Btn 
            variant="ghost"
            onClick={() => router.back()} 
            size="sm"
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <h1 className="text-2xl font-bold text-gray-900">{expense.description}</h1>
        </div>
        <BookmarkButton
          entityType="expense"
          entityId={expense.id.toString()}
          entityName={expense.description}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('details')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('form.amount')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.status')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {t(`status.${expense.status.toLowerCase()}`)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.expenseDate')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('form.provider')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {expense.provider ? `${expense.provider.code} - ${expense.provider.name}` : '-'}
                </p>
              </div>
            </div>
            {expense.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">{t('form.notes')}</p>
                <p className="text-gray-900 mt-2">{expense.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <AuditHistory
              entityType="expense"
              entityId={expense.id.toString()}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notas Internas</h2>
            <Btn
              onClick={() => setIsNotesDrawerOpen(true)}
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Agregar Nota
            </Btn>
          </div>
          <InternalNotesList
            key={notesRefreshKey}
            entityType="expense"
            entityId={expense.id.toString()}
          />
        </div>
      </div>

      <InternalNotesDrawer
        entityType="expense"
        entityId={expense.id.toString()}
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        drawerId="expense-notes-drawer"
        onSuccess={() => {
          setNotesRefreshKey(prev => prev + 1);
          setIsNotesDrawerOpen(false);
        }}
      />
    </div>
  );
}
