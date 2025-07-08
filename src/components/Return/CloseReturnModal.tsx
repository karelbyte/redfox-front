'use client';

import { useTranslations } from 'next-intl';
import { Return } from '@/types/return';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface CloseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  return: Return;
}

export default function CloseReturnModal({
  isOpen,
  onClose,
  onConfirm,
  return: returnItem,
}: CloseReturnModalProps) {
  const t = useTranslations('pages.returns');

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('closeModal.title', { item: t('title') })}
      message={t('closeModal.message', { 
        item: t('title'), 
        name: returnItem.code 
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