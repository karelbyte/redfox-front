'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Btn, SearchInput } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CertificationPack, CertificationPackType } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';
import EmptyState from '@/components/atoms/EmptyState';
import Drawer from '@/components/Drawer/Drawer';
import CertificationPackForm from '@/components/CertificationPack/CertificationPackForm';
import CertificationPackTable from '@/components/CertificationPack/CertificationPackTable';
import DeleteCertificationPackModal from '@/components/CertificationPack/DeleteCertificationPackModal';

export default function CertificationPacksPage() {
  const t = useTranslations('pages.certificationPacks');
  const [packs, setPacks] = useState<CertificationPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingPack, setEditingPack] = useState<CertificationPack | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [packToDelete, setPackToDelete] = useState<CertificationPack | null>(null);

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
      pack.name.toLowerCase().includes(search) ||
      pack.type.toLowerCase().includes(search) ||
      (pack.description && pack.description.toLowerCase().includes(search))
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
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsSaving(true);
      
      if (editingPack) {
        await certificationPackService.update(editingPack.id, formData);
        toastService.success(t('messages.successUpdated'));
      } else {
        await certificationPackService.create(formData);
        toastService.success(t('messages.successCreated'));
      }
      
      setShowDrawer(false);
      fetchPacks();
    } catch (error) {
      console.error('Error saving pack:', error);
      toastService.error(t('messages.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600">{t('subtitle')}</p>
            </div>
            <Btn
              onClick={handleCreatePack}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t('actions.create')}
            </Btn>
          </div>
        </div>

        <div className="mb-6">
          <SearchInput
            placeholder={t('searchPlaceholder')}
            onSearch={handleSearch}
            value={searchTerm}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          {filteredPacks.length === 0 ? (
            <EmptyState
              title={t('noData')}
              description={t('noDataDesc')}
            />
          ) : (
            <CertificationPackTable
              packs={filteredPacks}
              onEdit={handleEditPack}
              onDelete={handleDeletePack}
              onSetDefault={handleSetDefault}
            />
          )}
        </div>
      </div>

      <Drawer
        id="certification-pack-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingPack ? t('actions.edit') : t('actions.create')}
      >
        <CertificationPackForm
          pack={editingPack}
          onSubmit={handleFormSubmit}
          onCancel={handleDrawerClose}
          isSaving={isSaving}
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
