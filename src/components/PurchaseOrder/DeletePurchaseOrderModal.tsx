'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import ConfirmModal from '../Modal/ConfirmModal';

interface DeletePurchaseOrderModalProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePurchaseOrderModal({
  purchaseOrder,
  onClose,
  onConfirm
}: DeletePurchaseOrderModalProps) {
  const t = useTranslations('pages.purchaseOrders');

  if (!purchaseOrder) return null;

  return (
    <ConfirmModal
      isOpen={!!purchaseOrder}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('deleteModal.title', { item: t('title') })}
      message={
        <>
          {t('deleteModal.message', {
            item: t('title'),
            name: purchaseOrder.code
          })}
        </>
      }
      confirmText={t('actions.delete')}
    />
  );
} 