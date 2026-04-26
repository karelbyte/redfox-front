"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { certificationPackService } from "@/services/certification-packs.service";
import { toastService } from "@/services/toast.service";
import { CertificationPack, CertificationPackEmitter } from "@/types/certification-pack";
import CertificationPackEmitterForm from "@/components/CertificationPack/CertificationPackEmitterForm";
import CertificationPackEmitterTable from "@/components/CertificationPack/CertificationPackEmitterTable";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import Drawer from "@/components/Drawer/Drawer";
import { Btn, EmptyState } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CertificationPackEmittersPage() {
  const t = useTranslations("pages.certificationPacks");
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;
  const locale = params.locale as string;

  const [pack, setPack] = useState<CertificationPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEmitter, setSelectedEmitter] = useState<CertificationPackEmitter | null>(null);
  const emitterFormRef = useRef<any>(null);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [emitterToDeleteId, setEmitterToDeleteId] = useState<string | null>(null);

  const fetchPack = async () => {
    try {
      setIsLoading(true);
      const data = await certificationPackService.getById(packId);
      setPack(data);
    } catch (error) {
      toastService.error(t("messages.errorLoading"));
      router.push(`/${locale}/dashboard/configuracion/packs-sat`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (packId) {
      fetchPack();
    }
  }, [packId]);

  const handleDeleteClick = (emitterId: string) => {
    setEmitterToDeleteId(emitterId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!emitterToDeleteId) return;

    try {
      setIsSaving(true);
      await certificationPackService.removeEmitter(packId, emitterToDeleteId);
      toastService.success(t('emitters.messages.deleted'));
      setIsDeleteModalOpen(false);
      setEmitterToDeleteId(null);
      fetchPack();
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : "Error deleting emitter");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!pack) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/configuracion/packs-sat`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          />
          <div>
            <h1 className="text-xl font-semibold text-primary-800">
              {t("emitters.title")} - {pack.type}
            </h1>
          </div>
        </div>
        <Btn
          onClick={() => {
            setSelectedEmitter(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t("emitters.newEmitter")}
        </Btn>
      </div>

      {!pack.emitters?.length ? (
        <EmptyState
          title={t("emitters.emptyState.title")}
          description={t("emitters.emptyState.description")}
        />
      ) : (
        <CertificationPackEmitterTable
          emitters={pack.emitters}
          onEdit={(emitter: CertificationPackEmitter) => {
            setSelectedEmitter(emitter);
            setShowDrawer(true);
          }}
          onDelete={handleDeleteClick}
        />
      )}

      <Drawer
        id="emitter-drawer"
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedEmitter ? t("emitters.editEmitter") : t("emitters.newEmitter")}
        onSave={() => emitterFormRef.current?.submit()}
        isSaving={isSaving}
        width="max-w-2xl"
      >
        <CertificationPackEmitterForm
          ref={emitterFormRef}
          packId={packId}
          emitter={selectedEmitter}
          onClose={() => setShowDrawer(false)}
          onSuccess={() => {
            setShowDrawer(false);
            fetchPack();
          }}
          onSavingChange={setIsSaving}
        />
      </Drawer>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={tCommon('actions.delete')}
        message={tCommon('messages.confirmDelete', { item: t('emitters.title').toLowerCase() })}
        confirmText={tCommon('actions.delete')}
        cancelText={tCommon('actions.cancel')}
      />
    </div>
  );
}
