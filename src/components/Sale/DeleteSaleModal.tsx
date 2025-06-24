'use client'

import { useTranslations } from 'next-intl';
import { Sale } from '@/types/sale';
import { Btn } from '@/components/atoms';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteSaleModalProps {
  sale: Sale | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteSaleModal({ sale, onClose, onConfirm }: DeleteSaleModalProps) {
  const t = useTranslations('pages.sales');

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t('modals.delete.title')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t('modals.delete.message', { code: sale.code })}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Btn
              variant="danger"
              onClick={onConfirm}
              className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
            >
              {t('actions.delete')}
            </Btn>
            <Btn
              variant="secondary"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center text-sm shadow-sm sm:mt-0 sm:w-auto"
            >
              {t('actions.cancel')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
} 