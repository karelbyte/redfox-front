"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Client } from "@/types/client";
import ClientAddressForm from "@/components/Client/ClientAddressForm";
import ClientAddressTable from "@/components/Client/ClientAddressTable";
import ConfirmModal from "@/components/Modal/ConfirmModal";
import Drawer from "@/components/Drawer/Drawer";
import { Btn, EmptyState } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ClientAddressesPage() {
    const t = useTranslations("pages.clients");
    const tCommon = useTranslations('common');
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;
    const locale = params.locale as string;

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const addressFormRef = useRef<any>(null);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

    const fetchClient = async () => {
        try {
            setIsLoading(true);
            const data = await clientsService.getClient(clientId);
            setClient(data);
        } catch (error) {
            toastService.error(t("messages.errorLoading"));
            router.push(`/${locale}/dashboard/clientes`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchClient();
        }
    }, [clientId]);

    const handleDeleteClick = (addressId: string) => {
        setAddressToDeleteId(addressId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!addressToDeleteId) return;

        try {
            setIsSaving(true);
            await clientsService.updateClient(clientId, {
                delete_addresses: [addressToDeleteId]
            } as any);
            toastService.success(t('addresses.messages.deleted'));
            setIsDeleteModalOpen(false);
            setAddressToDeleteId(null);
            fetchClient();
        } catch (error) {
            toastService.error(error instanceof Error ? error.message : "Error deleting address");
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

    if (!client) return null;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Btn
                        variant="ghost"
                        onClick={() => router.push(`/${locale}/dashboard/clientes`)}
                        leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                    />
                    <div>
                        <h1 className="text-xl font-semibold text-primary-800">
                            {t("addresses.title")} - {client.name}
                        </h1>
                        <p className="text-sm text-gray-500">{client.code}</p>
                    </div>
                </div>
                <Btn
                    onClick={() => {
                        setSelectedAddress(null);
                        setShowDrawer(true);
                    }}
                    leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                    {t("addresses.newAddress")}
                </Btn>
            </div>

            {!client.addresses?.length ? (
                <EmptyState
                    title={t("addresses.title") + " no registradas"}
                    description="Este cliente aún no tiene direcciones configuradas."
                />
            ) : (
                <ClientAddressTable
                    addresses={client.addresses}
                    onEdit={(addr) => {
                        setSelectedAddress(addr);
                        setShowDrawer(true);
                    }}
                    onDelete={handleDeleteClick}
                />
            )}

            <Drawer
                id="address-drawer"
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                title={selectedAddress ? t("addresses.editAddress") : t("addresses.newAddress")}
                onSave={() => addressFormRef.current?.submit()}
                isSaving={isSaving}
                width="max-w-2xl"
            >
                <ClientAddressForm
                    ref={addressFormRef}
                    clientId={clientId}
                    address={selectedAddress}
                    onClose={() => setShowDrawer(false)}
                    onSuccess={() => {
                        setShowDrawer(false);
                        fetchClient();
                    }}
                    onSavingChange={setIsSaving}
                />
            </Drawer>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={tCommon('actions.delete')}
                message={tCommon('messages.confirmDelete', { item: t('addresses.title').toLowerCase() })}
                confirmText={tCommon('actions.delete')}
                cancelText={tCommon('actions.cancel')}
            />
        </div>
    );
}
