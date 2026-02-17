"use client";

import { useTranslations } from 'next-intl';
import { AccountReceivable } from '@/types/account-receivable';
import Drawer from '@/components/Drawer/Drawer';

interface PaymentHistoryDrawerProps {
  account: AccountReceivable;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentHistoryDrawer({
  account,
  isOpen,
  onClose,
}: PaymentHistoryDrawerProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

  const totalAmount = typeof account.totalAmount === 'string'
    ? parseFloat(account.totalAmount)
    : account.totalAmount;

  const remainingAmount = typeof account.remainingAmount === 'string'
    ? parseFloat(account.remainingAmount)
    : account.remainingAmount;

  const paidAmount = typeof account.paidAmount === 'string'
    ? parseFloat(account.paidAmount)
    : account.paidAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
    return t(`paymentDrawer.methods.${method}`) || method;
  };

  return (
    <Drawer
      id="payment-history-drawer"
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('paymentHistory.title')} - ${account.referenceNumber}`}
      width="max-w-3xl"
      hideFooter
    >
      <div className="space-y-6">
        {/* Account Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('paymentHistory.accountSummary')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t('table.client')}</p>
              <p className="text-sm font-medium">{account.client?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('table.dueDate')}</p>
              <p className="text-sm font-medium">{formatDate(account.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('table.totalAmount')}</p>
              <p className="text-sm font-medium">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('paymentHistory.paidAmount')}</p>
              <p className="text-sm font-medium text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('table.remainingAmount')}</p>
              <p className="text-sm font-medium text-red-600">{formatCurrency(remainingAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('table.status')}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                account.status === 'paid' ? 'bg-green-100 text-green-800' :
                account.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                account.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {t(`status.${account.status}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('paymentHistory.paymentsTitle')}</h3>
          {!account.payments || account.payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('paymentHistory.noPayments')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {account.payments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.paymentDate)}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </span>
                  </div>
                  
                  {payment.reference && (
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">{t('paymentDrawer.reference')}:</span> {payment.reference}
                    </p>
                  )}
                  
                  {payment.notes && (
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">{t('paymentDrawer.notes')}:</span> {payment.notes}
                    </p>
                  )}
                  
                  {payment.createdByUser && (
                    <p className="text-xs text-gray-500">
                      {t('paymentHistory.registeredBy')}: {payment.createdByUser.firstName} {payment.createdByUser.lastName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
