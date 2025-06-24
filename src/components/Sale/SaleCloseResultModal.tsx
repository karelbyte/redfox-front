'use client'

import { useTranslations } from 'next-intl';
import { SaleCloseResponse } from '@/types/sale';
import { Btn } from '@/components/atoms';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SaleCloseResultModalProps {
  closeResult: SaleCloseResponse | null;
  onClose: () => void;
}

export default function SaleCloseResultModal({ closeResult, onClose }: SaleCloseResultModalProps) {
  const t = useTranslations('pages.sales.modals.closeResult');
  
  if (!closeResult) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div 
              className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              style={{ backgroundColor: `rgb(var(--color-success-100))` }}
            >
              <CheckCircleIcon
                className="h-6 w-6"
                style={{ color: `rgb(var(--color-success-600))` }}
              />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t('title')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-4">
                  {closeResult.message}
                </p>
                
                {/* Detalles del cierre */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('details.saleCode')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{closeResult.saleCode}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('details.productsWithdrawn')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{closeResult.withdrawnProducts}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('details.totalQuantity')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{closeResult.totalQuantity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{t('details.completedAt')}:</span>
                    <span className="text-sm text-gray-900 font-semibold">{formatDate(closeResult.completedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Btn
              variant="primary"
              onClick={onClose}
              className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
            >
              {t('actions.continue')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
} 