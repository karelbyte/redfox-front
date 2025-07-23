'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrderRejectionResponse } from '@/types/purchase-order';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Btn } from '@/components/atoms';

interface PurchaseOrderRejectionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PurchaseOrderRejectionResponse | null;
}

export default function PurchaseOrderRejectionResultModal({
  isOpen,
  onClose,
  result
}: PurchaseOrderRejectionResultModalProps) {
  const t = useTranslations('pages.purchaseOrders');

  if (!isOpen || !result) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <XCircleIcon className="h-12 w-12 text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-center mb-4">
          {t('rejectionResult.title')}
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          {t('rejectionResult.message')}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="font-medium">{t('rejectionResult.purchaseOrderCode')}:</span>
            <span className="text-gray-700">{result.purchaseOrderCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{t('rejectionResult.rejectedAt')}:</span>
            <span className="text-gray-700">{formatDate(result.rejectedAt)}</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Btn
            onClick={onClose}
            className="px-6"
          >
            {t('rejectionResult.actions.continue')}
          </Btn>
        </div>
      </div>
    </div>
  );
} 