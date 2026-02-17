"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { clientsService } from "@/services/clients.service";
import { accountsReceivableService } from "@/services/accounts-receivable.service";
import { toastService } from "@/services/toast.service";
import { Client } from "@/types/client";
import ClientCreditForm from "@/components/Client/ClientCreditForm";
import Drawer from "@/components/Drawer/Drawer";
import { Btn } from "@/components/atoms";
import Loading from "@/components/Loading/Loading";
import { ArrowLeftIcon, PencilIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function ClientCreditPage() {
    const t = useTranslations("pages.clients");
    const tCredit = useTranslations("pages.clients.credit");
    const tCommon = useTranslations("common");
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;
    const locale = params.locale as string;

    const [client, setClient] = useState<Client | null>(null);
    const [creditAnalysis, setCreditAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const creditFormRef = useRef<any>(null);

    const fetchClient = async () => {
        try {
            setIsLoading(true);
            const data = await clientsService.getClient(clientId);
            setClient(data);
            
            // Fetch credit analysis
            if (data.credit?.is_active) {
                const analysis = await accountsReceivableService.getClientCreditAnalysis(clientId);
                setCreditAnalysis(analysis);
            }
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
            {!credit?.is_active || !creditAnalysis ? (
                <div className="mt-8 border-gray-200 border p-8 rounded-2xl text-center">
                    <h3 className="text-lg font-semibold text-primary-800 mb-2">
                        {tCredit('portfolioAnalysis')}
                    </h3>
                    <p className="text-primary-600 max-w-lg mx-auto">
                        {credit?.is_active 
                            ? tCredit('loadingAnalysis')
                            : tCredit('creditNotActive')
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* Análisis de Cartera */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-primary-800 mb-4">
                            {tCredit('portfolioAnalysis')}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            {/* Crédito Utilizado */}
                            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <BanknotesIcon className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{tCredit('usedCredit')}</p>
                                </div>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                        style: 'currency',
                                        currency: credit?.currency?.code || 'MXN'
                                    }).format(creditAnalysis.usedCredit)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {creditAnalysis.totalCredit > 0 
                                        ? `${((creditAnalysis.usedCredit / creditAnalysis.totalCredit) * 100).toFixed(1)}% ${tCredit('utilized')}`
                                        : `0% ${tCredit('utilized')}`
                                    }
                                </p>
                            </div>

                            {/* Crédito Disponible */}
                            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{tCredit('availableCredit')}</p>
                                </div>
                                <p className="text-xl font-bold text-green-700">
                                    {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                        style: 'currency',
                                        currency: credit?.currency?.code || 'MXN'
                                    }).format(creditAnalysis.availableCredit)}
                                </p>
                            </div>

                            {/* Saldo Vigente */}
                            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ClockIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{tCredit('currentBalance')}</p>
                                </div>
                                <p className="text-xl font-bold text-blue-700">
                                    {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                        style: 'currency',
                                        currency: credit?.currency?.code || 'MXN'
                                    }).format(creditAnalysis.currentBalance)}
                                </p>
                            </div>

                            {/* Saldo Vencido */}
                            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{tCredit('overdueBalance')}</p>
                                </div>
                                <p className="text-xl font-bold text-red-700">
                                    {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                        style: 'currency',
                                        currency: credit?.currency?.code || 'MXN'
                                    }).format(creditAnalysis.overdueBalance)}
                                </p>
                            </div>
                        </div>

                        {/* Tabla de Cuentas por Cobrar */}
                        {creditAnalysis.accounts && creditAnalysis.accounts.length > 0 && (
                            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-900">{tCredit('accountsReceivable')}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('reference')}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('issueDate')}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('dueDate')}
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('totalAmount')}
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('remainingAmount')}
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('status')}
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {tCredit('aging')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {creditAnalysis.accounts.map((account: any) => (
                                                <tr key={account.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {account.referenceNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(account.issueDate).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(account.dueDate).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                        {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                                            style: 'currency',
                                                            currency: credit?.currency?.code || 'MXN'
                                                        }).format(account.totalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                        {new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
                                                            style: 'currency',
                                                            currency: credit?.currency?.code || 'MXN'
                                                        }).format(account.remainingAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            account.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                            account.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            account.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {tCredit(`statuses.${account.status}`)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {account.daysOverdue > 0 ? (
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                account.agingCategory === '1-30' ? 'bg-yellow-100 text-yellow-800' :
                                                                account.agingCategory === '31-60' ? 'bg-orange-100 text-orange-800' :
                                                                account.agingCategory === '61-90' ? 'bg-red-100 text-red-800' :
                                                                'bg-red-200 text-red-900'
                                                            }`}>
                                                                {account.daysOverdue} {tCredit('daysOverdue')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

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
