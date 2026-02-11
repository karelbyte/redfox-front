import { useTranslations } from 'next-intl';
import { PencilIcon, TrashIcon, IdentificationIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Btn } from "@/components/atoms";

interface ClientTaxDataTableProps {
    taxData: any[];
    onEdit: (tax: any) => void;
    onDelete: (taxDataId: string) => void;
}

export default function ClientTaxDataTable({
    taxData,
    onEdit,
    onDelete,
}: ClientTaxDataTableProps) {
    const t = useTranslations('pages.clients.taxData');
    const tCommon = useTranslations('common');

    return (
        <div
            className="bg-white rounded-lg overflow-hidden"
            style={{
                boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
            }}
        >
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('isMain')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('taxDocument')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('taxName')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('taxSystem')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('defaultInvoiceUse')}
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('table.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {taxData.map((tax) => (
                        <tr key={tax.id} className="hover:bg-primary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    {tax.is_main ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                            <StarIconSolid className="h-3 w-3" /> {t('isMain')}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                            Secundario
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {tax.tax_document}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tax.tax_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {tax.tax_system}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {tax.default_invoice_use}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Btn
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(tax)}
                                        leftIcon={<PencilIcon className="h-4 w-4" />}
                                        title={tCommon('actions.edit')}
                                    />
                                    <Btn
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(tax.id)}
                                        leftIcon={<TrashIcon className="h-4 w-4 text-red-500" />}
                                        title={tCommon('actions.delete')}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
