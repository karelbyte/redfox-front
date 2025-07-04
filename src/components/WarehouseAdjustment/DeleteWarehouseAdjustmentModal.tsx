'use client';

import { useTranslations } from 'next-intl';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface DeleteWarehouseAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adjustment: WarehouseAdjustment;
}

export function DeleteWarehouseAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  adjustment,
}: DeleteWarehouseAdjustmentModalProps) {
  const t = useTranslations('pages.warehouseAdjustments');

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('deleteModal.title', { item: t('title') })}
      message={t('deleteModal.message', { 
        item: t('title'), 
        name: adjustment.code 
      })}
      confirmText={t('actions.delete')}
      cancelText={t('actions.cancel')}
      confirmButtonStyle={{
        backgroundColor: '#ef4444',
        color: 'white',
      }}
    />
  );
} 