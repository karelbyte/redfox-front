'use client'

import { CertificationPack } from '@/types/certification-pack';
import { useTranslations } from 'next-intl';
import ConfirmModal from '@/components/Modal/ConfirmModal';

interface DeleteCertificationPackModalProps {
  pack: CertificationPack | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCertificationPackModal({
  pack,
  onConfirm,
  onCancel,
}: DeleteCertificationPackModalProps) {
  const t = useTranslations('pages.certificationPacks');

  return (
    <ConfirmModal
      isOpen={!!pack}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={t('deleteModal.title')}
      message={pack ? t('deleteModal.message', { name: pack.name }) : ''}
      confirmText={t('actions.delete')}
      cancelText={t('actions.cancel')}
    />
  );
}
