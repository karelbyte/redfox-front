'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CertificationPack } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';
import { usePermissions } from '@/hooks/usePermissions';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import CertificationPackForm, { CertificationPackFormRef } from '@/components/CertificationPack/CertificationPackForm';
import CertificationPackTable from '@/components/CertificationPack/CertificationPackTable';
import DeleteCertificationPackModal from '@/components/CertificationPack/DeleteCertificationPackModal';

export default function CertificationPacksPage() {
  const t = useTranslations('pages.certificationPacks');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const [packs, setPacks] = useState<CertificationPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingPack, setEditingPack] = useState<CertificationPack | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [packToDelete, setPackToDelete] = useState<CertificationPack | null>(null);
  const formRef = useRef<CertificationPackFormRef>(null);

  // Check permissions
  if (!can(['certification_pack_module_view'])) {
    return (
      <div className="p-6">
        <EmptyState
          title={tCommon('noPermission')}
          description={tCommon('noPermissionDescription')}
        />
      </div>
    );
  }

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificationPackService.getAll();
      setPacks(data || []);
    } catch (error) {
      console.error('Error fetching packs:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredPacks = packs.filter(pack => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      pack.type.toLowerCase().includes(search)
    );
  });

  const handleCreatePack = () => {
    setEditingPack(null);
    setShowDrawer(true);
  };

  const handleEditPack = (pack: CertificationPack) => {
    setEditingPack(pack);
    setShowDrawer(true);
  };

  const handleDeletePack = (pack: CertificationPack) => {
    setPackToDelete(pack);
  };

  const handleConfirmDelete = async () => {
    if (!packToDelete) return;

    try {
      await certificationPackService.delete(packToDelete.id);
      toastService.success(t('messages.successDeleted'));
      fetchPacks();
      setPackToDelete(null);
    } catch (error) {
      console.error('Error deleting pack:', error);
      toastService.error(t('messages.errorDeleting'));
    }
  };

  const handleSetDefault = async (pack: CertificationPack) => {
    try {
      await certificationPackService.setDefault(pack.id);
      toastService.success(t('messages.successSetDefault'));
      fetchPacks();
    } catch (error) {
      console.error('Error setting default pack:', error);
      toastService.error(t('messages.errorSetDefault'));
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingPack(null);
    setIsSaving(false);
    setIsFormValid(false);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          {t('title')}
        </h1>
        <div className="flex items-center gap-2">
          <Btn
            onClick={handleCreatePack}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('actions.create')}
          </Btn>
        </div>
      </div>

      <div className="mt-6">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          onSearch={handleSearch}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : filteredPacks.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noData')}
          description={t('noDataDesc')}
        />
      ) : (
        <div className="mt-6">
          <CertificationPackTable
            packs={filteredPacks}
            onEdit={handleEditPack}
            onDelete={handleDeletePack}
            onSetDefault={handleSetDefault}
          />
        </div>
      )}

      <Drawer
        id="certification-pack-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingPack ? t('actions.edit') : t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <CertificationPackForm
          ref={formRef}
          pack={editingPack}
          onSuccess={() => {
            handleDrawerClose();
            fetchPacks();
          }}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {packToDelete && (
        <DeleteCertificationPackModal
          pack={packToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPackToDelete(null)}
        />
      )}
    </div>
  );
}
