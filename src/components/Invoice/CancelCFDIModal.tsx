import { useTranslations } from 'next-intl';
import { Invoice } from '@/types/invoice';
import { useState } from 'react';

const CANCEL_REASONS = [
  { k: '01', label: 'Comprobante emitido con errores con relación' },
  { k: '02', label: 'Comprobante emitido con errores sin relación' },
  { k: '03', label: 'No se llevó a cabo la operación' },
  { k: '04', label: 'Operación nominativa relacionada en la factura global' },
];

interface CancelCFDIModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export default function CancelCFDIModal({ invoice, onClose, onConfirm, isLoading }: CancelCFDIModalProps) {
  const t = useTranslations('pages.invoices');
  const [reason, setReason] = useState('01');

  if (!invoice) return null;

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cancelCFDIModal.reasonLabel')}
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {CANCEL_REASONS.map((r) => (
                      <option key={r.k} value={r.k}>{r.k} — {r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
              onClick={() => onConfirm(reason)}
              disabled={isLoading}
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
