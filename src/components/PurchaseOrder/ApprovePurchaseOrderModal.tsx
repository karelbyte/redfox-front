'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import { emailConfigService } from '@/services/email-config.service';
import { CheckCircleIcon, EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ApprovePurchaseOrderModalProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: (sendEmail: boolean) => void;
}

export default function ApprovePurchaseOrderModal({
  purchaseOrder,
  onClose,
  onConfirm,
}: ApprovePurchaseOrderModalProps) {
  const t = useTranslations('pages.purchaseOrders');
  const [sendEmail, setSendEmail] = useState(false);
  const [hasEmailConfig, setHasEmailConfig] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);

  useEffect(() => {
    if (!purchaseOrder) return;
    setCheckingEmail(true);
    setSendEmail(false);
    emailConfigService.getConfig()
      .then(() => setHasEmailConfig(true))
      .catch(() => setHasEmailConfig(false))
      .finally(() => setCheckingEmail(false));
  }, [purchaseOrder]);

  if (!purchaseOrder) return null;

  const providerHasEmail = !!purchaseOrder.provider?.email;
  const canSendEmail = hasEmailConfig && providerHasEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('approveModal.title', { item: t('title') })}
            </h3>
            <p className="text-sm text-gray-500">{purchaseOrder.code}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-5">
          {t('approveModal.message', { item: t('title'), name: purchaseOrder.code })}
        </p>

        {/* Sección de correo */}
        {!checkingEmail && (
          <div className="border rounded-lg p-4 mb-5 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {t('approveModal.emailSection')}
              </span>
            </div>

            {/* Advertencias */}
            {!hasEmailConfig && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{t('approveModal.noEmailConfig')}</span>
              </div>
            )}
            {!providerHasEmail && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{t('approveModal.noProviderEmail', { name: purchaseOrder.provider.name })}</span>
              </div>
            )}

            {/* Checkbox */}
            <label className={`flex items-center gap-2 cursor-pointer ${!canSendEmail ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <input
                type="checkbox"
                checked={sendEmail}
                disabled={!canSendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                {t('approveModal.sendEmailToProvider', { email: purchaseOrder.provider.email || '' })}
              </span>
            </label>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={() => onConfirm(sendEmail)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            {t('actions.approve')}
          </button>
        </div>
      </div>
    </div>
  );
}
