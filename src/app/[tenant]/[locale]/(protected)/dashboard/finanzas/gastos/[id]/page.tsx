'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, BanknotesIcon, CalendarIcon, UserIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline';
import { expensesService } from '@/services/expenses.service';
import { toastService } from '@/services/toast.service';
import { Expense, ExpensePayment } from '@/types/expense';
import { Btn } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('expenses');
  const tCommon = useTranslations('common');
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [payments, setPayments] = useState<ExpensePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const expenseId = params.id as string;

  useEffect(() => {
    if (expenseId) {
      loadExpenseDetails();
    }
  }, [expenseId]);

  const loadExpenseDetails = async () => {
    try {
      setLoading(true);
      const [expenseData, paymentsData] = await Promise.all([
        expensesService.getExpense(expenseId),
        expensesService.getPayments(expenseId),
      ]);
      setExpense(expenseData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading expense details:', error);
      toastService.error(t('messages.errorLoading'));
      router.push(`/${locale}/dashboard/finanzas/gastos`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    return t(`paymentDrawer.methods.${method}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('notFound')}</h2>
        <Btn onClick={() => router.push(`/${locale}/dashboard/finanzas/gastos`)}>
          {tCommon('actions.back')}
        </Btn>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/finanzas/gastos`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {tCommon('actions.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {t('details')} - {expense.description}
            </h1>
            <p className="text-sm text-secondary-500">Información detallada del gasto</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
            expense.status === 'paid' ? 'bg-green-50 text-green-700' :
            expense.status === 'approved' ? 'bg-blue-50 text-blue-700' :
            expense.status === 'rejected' ? 'bg-red-50 text-red-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            <TagIcon className="h-4 w-4 mr-1.5" />
            {t(`status.${expense.status}`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Expense Summary Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-secondary-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-secondary-600 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-primary-500" />
                Resumen del Gasto
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <InfoItem label={t('form.description')} value={expense.description} />
              <InfoItem label={t('table.category')} value={expense.category?.name || '-'} />
              <InfoItem 
                label={t('table.provider')} 
                value={expense.provider ? `${expense.provider.code} - ${expense.provider.name}` : '-'} 
                icon={<UserIcon className="h-4 w-4" />} 
              />
              <InfoItem 
                label={t('form.expenseDate')} 
                value={formatDate(expense.expenseDate)} 
                icon={<CalendarIcon className="h-4 w-4" />} 
              />
              <InfoItem label={t('table.amount')} value={formatCurrency(expense.amount)} isHighlight />
              <InfoItem 
                label="Monto Pagado" 
                value={formatCurrency(expense.paidAmount)} 
                valueClass="text-green-600" 
                isHighlight 
              />
              <InfoItem 
                label={t('table.remaining')} 
                value={formatCurrency(expense.remainingAmount)} 
                valueClass="text-primary-500" 
                isHighlight 
              />
              {expense.reference && (
                <InfoItem label={t('form.reference')} value={expense.reference} />
              )}
            </div>
            {expense.notes && (
              <div className="px-6 pb-6 pt-2 italic text-secondary-600 text-sm">
                <p className="font-semibold not-italic text-secondary-500 mb-1">{t('form.notes')}:</p>
                {expense.notes}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-secondary-50/50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-secondary-800 flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-primary-500" />
                Historial de Pagos
              </h2>
              <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                {payments.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <div className="p-12 text-center">
                  <BanknotesIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No hay pagos registrados</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-secondary-50/50 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                          <BanknotesIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-secondary-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-secondary-500 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDateTime(payment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-secondary-100 text-secondary-700">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                        {payment.reference && (
                          <p className="text-xs text-secondary-600">
                            <span className="font-semibold">{t('paymentDrawer.reference')}:</span> {payment.reference}
                          </p>
                        )}
                      </div>
                    </div>
                    {(payment.notes || payment.createdByUser) && (
                      <div className="mt-4 ml-14 p-3 bg-secondary-50 rounded-lg text-sm">
                        {payment.notes && <p className="text-secondary-500 mb-2 leading-relaxed">{payment.notes}</p>}
                        {payment.createdByUser && (
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary-400 flex items-center gap-1.5">
                            <UserIcon className="h-3 w-3" />
                            <span className='text-gray-500'>Registrado por</span>: {payment.createdByUser.firstName} {payment.createdByUser.lastName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 text-black shadow-sm relative overflow-hidden ring-1 ring-gray-100">
            <div className="relative z-10">
              <h3 className="text-secondary-800 text-xs font-bold uppercase tracking-widest mb-4">Estado del Gasto</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-secondary-500 text-xs mb-1">{t('table.remaining')}</p>
                  <p className="text-3xl text-secondary-500">{formatCurrency(expense.remainingAmount)}</p>
                </div>  
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <p className="text-secondary-500 text-xs">Progreso de Pago</p>
                    <p className="text-sm font-bold text-black">
                      {Math.round((Number(expense.paidAmount) / Number(expense.amount)) * 100)}%
                    </p>
                  </div>
                  <div className="h-2 w-full bg-secondary-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${(Number(expense.paidAmount) / Number(expense.amount)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-secondary-800 font-bold mb-4">Información Adicional</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">ID de Referencia:</span>
                <span className="font-mono font-medium text-secondary-900">{expense.id.split('-')[0]}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Creado:</span>
                <span className="text-secondary-900">{formatDate(expense.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Actualizado:</span>
                <span className="text-secondary-900">{formatDate(expense.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, valueClass = "text-secondary-400", isHighlight = false }: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
  isHighlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-secondary-400 uppercase tracking-tighter flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <p className={`${isHighlight ? 'text-lg text-secondary-500' : 'text-sm'} ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
