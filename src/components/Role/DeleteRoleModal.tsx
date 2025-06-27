'use client';

import { useTranslations } from 'next-intl';
import { Role } from '@/types/role';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface DeleteRoleModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteRoleModal({
  role,
  isOpen,
  onClose,
  onConfirm,
  loading
}: DeleteRoleModalProps) {
  const t = useTranslations('pages.roles');

  if (!role) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title={t('deleteModal.title', { item: t('title') })}
      message={t('deleteModal.message', { 
        item: t('title'), 
        name: role.description 
      })}
    />
  );
} 