import { useTranslations } from 'next-intl';
import { WarehouseAdjustmentCloseResponse } from '@/types/warehouse-adjustment';
import { Btn } from '@/components/atoms';

interface WarehouseAdjustmentCloseResultModalProps {
  closeResult: WarehouseAdjustmentCloseResponse | null;
  onClose: () => void;
}

export default function WarehouseAdjustmentCloseResultModal({ closeResult, onClose }: WarehouseAdjustmentCloseResultModalProps) {
  const t = useTranslations('pages.warehouseAdjustments');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!closeResult) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
            {t('closeResult.title')}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              {closeResult.message}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{t('closeResult.adjustmentCode')}:</span>
                <span className="text-sm text-gray-900 font-semibold">{closeResult.adjustmentCode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{t('closeResult.transferredProducts')}:</span>
                <span className="text-sm text-gray-900 font-semibold">{closeResult.transferredProducts}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{t('closeResult.totalQuantity')}:</span>
                <span className="text-sm text-gray-900 font-semibold">{closeResult.totalQuantity}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{t('closeResult.closedAt')}:</span>
                <span className="text-sm text-gray-900 font-semibold">{formatDate(closeResult.closedAt)}</span>
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