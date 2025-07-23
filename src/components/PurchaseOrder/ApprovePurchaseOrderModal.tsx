'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import ConfirmModal from '../Modal/ConfirmModal';

interface ApprovePurchaseOrderModalProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ApprovePurchaseOrderModal({
  purchaseOrder,
  onClose,
  onConfirm
}: ApprovePurchaseOrderModalProps) {
  const t = useTranslations('pages.purchaseOrders');

  if (!purchaseOrder) return null;

  return (
    <ConfirmModal
      isOpen={!!purchaseOrder}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('approveModal.title', { item: t('title') })}
      message={
        <>
          {t('approveModal.message', {
            item: t('title'),
            name: purchaseOrder.code
          })}
        </>
      }
      confirmText={t('actions.approve')}
    />
  );
} 