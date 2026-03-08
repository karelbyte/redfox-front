"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Provider } from "@/types/provider";
import ProviderTaxDataForm from "@/components/Provider/ProviderTaxDataForm";
import ProviderTaxDataTable from "@/components/Provider/ProviderTaxDataTable";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import Drawer from "@/components/Drawer/Drawer";
import { Btn, EmptyState } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ProviderTaxDataPage() {
    const t = useTranslations("pages.providers");
    const tCommon = useTranslations('common');
    const params = useParams();
    const router = useRouter();
    const providerId = params.id as string;
    const locale = params.locale as string;

    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedTaxData, setSelectedTaxData] = useState<any>(null);
    const taxDataFormRef = useRef<any>(null);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taxToDeleteId, setTaxToDeleteId] = useState<string | null>(null);

    const fetchProvider = async () => {
        try {
            setIsLoading(true);
            const data = await providersService.getProvider(providerId);
            setProvider(data);
        } catch (error) {
            toastService.error(t("messages.errorLoading"));
            router.push(`/${locale}/dashboard/proveedores`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (providerId) {
            fetchProvider();
        }
    }, [providerId]);

    const handleDeleteClick = (taxDataId: string) => {
        setTaxToDeleteId(taxDataId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!taxToDeleteId) return;

        try {
            setIsSaving(true);
            await providersService.updateProvider(providerId, {
                delete_tax_data: [taxToDeleteId]
            } as any);
            toastService.success(t('taxData.messages.deleted'));
            setIsDeleteModalOpen(false);
            setTaxToDeleteId(null);
            fetchProvider();
        } catch (error) {
            toastService.error(error instanceof Error ? error.message : "Error deleting tax data");
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

    if (!provider) return null;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Btn
                        variant="ghost"
                        onClick={() => router.push(`/${locale}/dashboard/proveedores`)}
                        leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                    />
                    <div>
                        <h1 className="text-xl font-semibold text-primary-800">
                            {t("taxData.title")} - {provider.name}
                        </h1>
                        <p className="text-sm text-gray-500">{provider.code}</p>
                    </div>
                </div>
                <Btn
                    onClick={() => {
                        setSelectedTaxData(null);
                        setShowDrawer(true);
                    }}
                    leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                    {t("taxData.newTaxData")}
                </Btn>
            </div>

            {!provider.taxData?.length ? (
                <EmptyState
                    title={t("taxData.title") + " no registrados"}
                    description="Este proveedor aún no tiene perfiles fiscales configurados."
                />
            ) : (
                <ProviderTaxDataTable
                    taxData={provider.taxData}
                    onEdit={(tax) => {
                        setSelectedTaxData(tax);
                        setShowDrawer(true);
                    }}
                    onDelete={handleDeleteClick}
                />
            )}

            <Drawer
                id="tax-drawer"
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                title={selectedTaxData ? t("taxData.editTaxData") : t("taxData.newTaxData")}
                onSave={() => taxDataFormRef.current?.submit()}
                isSaving={isSaving}
                width="max-w-2xl"
            >
                <ProviderTaxDataForm
                    ref={taxDataFormRef}
                    providerId={providerId}
                    taxData={selectedTaxData}
                    onClose={() => setShowDrawer(false)}
                    onSuccess={() => {
                        setShowDrawer(false);
                        fetchProvider();
                    }}
                    onSavingChange={setIsSaving}
                />
            </Drawer>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={tCommon('actions.delete')}
                message={tCommon('messages.confirmDelete', { item: t('taxData.title').toLowerCase() })}
                confirmText={tCommon('actions.delete')}
                cancelText={tCommon('actions.cancel')}
            />
        </div>
    );
}
