"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { providersService } from "@/services/providers.service";
import { toastService } from "@/services/toast.service";
import { Provider } from "@/types/provider";
import ProviderCreditForm from "@/components/Provider/ProviderCreditForm";
import Drawer from "@/components/Drawer/Drawer";
import { Btn } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { ArrowLeftIcon, PencilIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ProviderCreditPage() {
    const t = useTranslations("pages.providers");
    const tCommon = useTranslations("common");
    const params = useParams();
    const router = useRouter();
    const providerId = params.id as string;
    const locale = params.locale as string;

    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const creditFormRef = useRef<any>(null);

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

    const formatCurrency = (amount: number, currencyCode?: string) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currencyCode || 'MXN',
        }).format(amount);
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
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Btn
                        variant="ghost"
                        onClick={() => router.push(`/${locale}/dashboard/proveedores`)}
                        leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                    />
                    <div>
                        <h1 className="text-xl font-semibold text-primary-800">
                            {t("credit.title")} - {provider.name}
                        </h1>
                        <p className="text-sm text-gray-500">{provider.code}</p>
                    </div>
                </div>
                <Btn
                    onClick={() => setShowDrawer(true)}
                    leftIcon={<PencilIcon className="h-5 w-5" />}
                >
                    {t("credit.editCredit")}
                </Btn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Límite de Crédito */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <BanknotesIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('credit.limit')}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(provider.credit?.credit_limit || 0, provider.credit?.currency?.code)}
                        </p>
                    </div>
                </div>

                {/* Días de Crédito */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('credit.days')}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {provider.credit?.credit_days || 0} {t('credit.daysUnit')}
                        </p>
                    </div>
                </div>

                {/* Estado */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${provider.credit?.is_active ? 'bg-green-50' : 'bg-red-50'}`}>
                        {provider.credit?.is_active ? (
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        ) : (
                            <XCircleIcon className="h-8 w-8 text-red-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('credit.isActive')}</p>
                        <p className={`text-xl font-bold ${provider.credit?.is_active ? 'text-green-700' : 'text-red-700'}`}>
                            {provider.credit?.is_active ? tCommon('status.active') : tCommon('status.inactive')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placeholder para saldos futuros */}
            <div className="mt-8 border-gray-200 border p-8 rounded-2xl text-center">
                <h3 className="text-lg font-semibold text-primary-800 mb-2">{t('credit.analysisTitle') || 'Análisis de Deuda (Próximamente)'}</h3>
                <p className="text-primary-600 max-w-lg mx-auto">
                    {t('credit.analysisDescription') || 'Aquí podrás visualizar el saldo por pagar, saldo vencido y la antigüedad de la deuda con el proveedor una vez que se completen los módulos de recepciones y pagos.'}
                </p>
            </div>

            <Drawer
                id="credit-drawer"
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                title={t("credit.editCredit")}
                onSave={() => creditFormRef.current?.submit()}
                isSaving={isSaving}
                width="max-w-2xl"
            >
                <ProviderCreditForm
                    ref={creditFormRef}
                    providerId={providerId}
                    credit={provider.credit}
                    onClose={() => setShowDrawer(false)}
                    onSuccess={() => {
                        setShowDrawer(false);
                        fetchProvider();
                    }}
                    onSavingChange={setIsSaving}
                />
            </Drawer>
        </div>
    );
}
