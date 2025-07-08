'use client';

import { useTranslations } from 'next-intl';
import { ReturnCloseResponse } from '@/types/return';
import { Btn } from '@/components/atoms';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ReturnCloseResultModalProps {
  closeResult: ReturnCloseResponse | null;
  onClose: () => void;
}

export default function ReturnCloseResultModal({ closeResult, onClose }: ReturnCloseResultModalProps) {
  const t = useTranslations('pages.returns.closeResult');
  
  if (!closeResult) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalQuantity = closeResult.details.reduce((sum, detail) => sum + detail.quantity, 0);
  const totalAmount = closeResult.details.reduce((sum, detail) => sum + (detail.quantity * detail.price), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t('title')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-green-800 font-medium mb-4">
                  {t('message')}
                </p>
                
                {/* Detalles del cierre */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('returnCode')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{closeResult.code}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('returnedProducts')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{closeResult.details.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('totalQuantity')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-sm text-gray-900 font-semibold">{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('closedAt')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{formatDate(closeResult.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              {t('actions.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 