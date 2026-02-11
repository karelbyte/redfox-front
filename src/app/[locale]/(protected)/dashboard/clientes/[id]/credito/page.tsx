"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { clientsService } from "@/services/clients.service";
import { toastService } from "@/services/toast.service";
import { Client } from "@/types/client";
import ClientCreditForm from "@/components/Client/ClientCreditForm";
import Drawer from "@/components/Drawer/Drawer";
import { Btn } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { ArrowLeftIcon, PencilIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ClientCreditPage() {
    const t = useTranslations("pages.clients");
    const tCredit = useTranslations("pages.clients.credit");
    const tCommon = useTranslations("common");
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;
    const locale = params.locale as string;

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const creditFormRef = useRef<any>(null);

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loading size="lg" />
            </div>
        );
    }

    if (!client) return null;

    const credit = client.credit;

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
                            {tCredit("title")} - {client.name}
                        </h1>
                        <p className="text-sm text-gray-500">{client.code}</p>
                    </div>
                </div>
                <Btn
                    onClick={() => setShowDrawer(true)}
                    leftIcon={<PencilIcon className="h-5 w-5" />}
                >
                    {t("actions.edit") || "Editar"}
                </Btn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Límite de Crédito */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <BanknotesIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{tCredit('limit')}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                style: 'currency',
                                currency: credit?.currency?.code || 'MXN'
                            }).format(credit?.credit_limit || 0)}
                        </p>
                    </div>
                </div>

                {/* Días de Crédito */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{tCredit('days')}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {credit?.credit_days || 0} {tCredit('daysUnit')}
                        </p>
                    </div>
                </div>

                {/* Estado */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${credit?.is_active ? 'bg-green-50' : 'bg-red-50'}`}>
                        {credit?.is_active ? (
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        ) : (
                            <XCircleIcon className="h-8 w-8 text-red-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{tCredit('isActive')}</p>
                        <p className={`text-xl font-bold ${credit?.is_active ? 'text-green-700' : 'text-red-700'}`}>
                            {credit?.is_active ? tCommon("status.active") : tCommon("status.inactive")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder para saldos futuros */}
            <div className="mt-8 border-gray-200 border p-8 rounded-2xl text-center">
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Análisis de Cartera (Próximamente)</h3>
                <p className="text-primary-600 max-w-lg mx-auto">
                    Aquí podrás visualizar el saldo utilizado, saldo vencido y la antigüedad de la deuda del cliente
                    una vez que se completen los módulos de ventas y cobranza.
                </p>
            </div>

            <Drawer
                id="credit-drawer"
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                title={tCredit("editCredit")}
                onSave={() => creditFormRef.current?.submit()}
                isSaving={isSaving}
                width="max-w-xl"
            >
                <ClientCreditForm
                    ref={creditFormRef}
                    clientId={clientId}
                    credit={credit}
                    onClose={() => setShowDrawer(false)}
                    onSuccess={() => {
                        setShowDrawer(false);
                        fetchClient();
                    }}
                    onSavingChange={setIsSaving}
                />
            </Drawer>
        </div >
    );
}
