'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import ConfirmModal from '../Modal/ConfirmModal';

interface RejectPurchaseOrderModalProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RejectPurchaseOrderModal({
  purchaseOrder,
  onClose,
  onConfirm
}: RejectPurchaseOrderModalProps) {
  const t = useTranslations('pages.purchaseOrders');

  if (!purchaseOrder) return null;

  return (
    <ConfirmModal
      isOpen={!!purchaseOrder}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('rejectModal.title', { item: t('title') })}
      message={
        <>
          {t('rejectModal.message', {
            item: t('title'),
            name: purchaseOrder.code
          })}
        </>
      }
      confirmText={t('actions.reject')}
    />
  );
} 