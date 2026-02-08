'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User } from '@/types/user';
import { usersService } from '@/services/users.service';
import { toastService } from '@/services/toast.service';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await usersService.deleteUser(user.id);
      toastService.success(t('messages.userDeleted'));
      onConfirm();
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorDeleting'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title={t('deleteModal.title', { item: t('title') })}
      message={t('deleteModal.message', { 
        item: t('title'), 
        name: user.name 
      })}
      confirmText={isDeleting ? t('actions.deleting') : t('actions.delete')}
    />
  );
} 