'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrderDetail } from '@/types/purchase-order';
import ConfirmModal from '../Modal/ConfirmModal';

interface DeleteProductModalProps {
  product: PurchaseOrderDetail | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProductModal({
  product,
  onClose,
  onConfirm
}: DeleteProductModalProps) {
  const t = useTranslations('pages.purchaseOrders');

  if (!product) return null;

  return (
    <ConfirmModal
      isOpen={!!product}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('deleteProduct.title')}
      message={
        <>
          {t('deleteProduct.message', {
            productName: product.product.name
          })}
        </>
      }
      confirmText={t('actions.delete')}
    />
  );
} 