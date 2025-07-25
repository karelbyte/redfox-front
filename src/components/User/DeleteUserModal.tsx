'use client';

import { useTranslations } from 'next-intl';
import { User } from '@/types/user';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  user,
  isOpen,
  onClose,
  onConfirm
}: DeleteUserModalProps) {
  const t = useTranslations('pages.users');

  if (!user) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('deleteModal.title', { item: t('title') })}
      message={t('deleteModal.message', { 
        item: t('title'), 
        name: user.name 
      })}
    />
  );
} 