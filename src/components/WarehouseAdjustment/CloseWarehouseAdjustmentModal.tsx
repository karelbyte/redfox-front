'use client';

import { useTranslations } from 'next-intl';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface CloseWarehouseAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adjustment: WarehouseAdjustment;
}

export function CloseWarehouseAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  adjustment,
}: CloseWarehouseAdjustmentModalProps) {
  const t = useTranslations('pages.warehouseAdjustments');

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('closeModal.title', { item: t('title') })}
      message={t('closeModal.message', { 
        item: t('title'), 
        name: adjustment.code 
      })}
      confirmText={t('actions.close')}
      cancelText={t('actions.cancel')}
      confirmButtonStyle={{
        backgroundColor: '#10b981',
        color: 'white',
      }}
    />
  );
} 