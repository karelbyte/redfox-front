import { useTranslations } from 'next-intl';
import { Invoice } from '@/types/invoice';
import { useState } from 'react';

interface CancelCFDIModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export default function CancelCFDIModal({ invoice, onClose, onConfirm, isLoading }: CancelCFDIModalProps) {
  const t = useTranslations('pages.invoices');
  const [reason, setReason] = useState('');

  if (!invoice) return null;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t('cancelCFDIModal.title')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t('cancelCFDIModal.message', { code: invoice.code })}
                </p>
                <div className="mt-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    {t('cancelCFDIModal.reasonLabel')}
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('cancelCFDIModal.reasonPlaceholder')}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
              onClick={handleConfirm}
              disabled={isLoading || !reason.trim()}
            >
              {isLoading ? t('cancelCFDIModal.cancelling') : t('cancelCFDIModal.confirm')}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('cancelCFDIModal.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
