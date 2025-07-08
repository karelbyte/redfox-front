'use client';

import { useTranslations } from 'next-intl';
import { Return } from '@/types/return';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface DeleteReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  return: Return;
}

export default function DeleteReturnModal({
  isOpen,
  onClose,
  onConfirm,
  return: returnItem,
}: DeleteReturnModalProps) {
  const t = useTranslations('pages.returns');

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('deleteModal.title', { item: t('title') })}
      message={t('deleteModal.message', { 
        item: t('title'), 
        name: returnItem.code 
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