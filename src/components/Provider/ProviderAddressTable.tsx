import { useTranslations } from 'next-intl';
import { PencilIcon, TrashIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Btn } from "@/components/atoms";

interface ProviderAddressTableProps {
    addresses: any[];
    onEdit: (address: any) => void;
    onDelete: (addressId: string) => void;
}

export default function ProviderAddressTable({
    addresses,
    onEdit,
    onDelete,
}: ProviderAddressTableProps) {
    const t = useTranslations('pages.providers.addresses');
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
                            {t('type')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('street')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('neighborhood')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('zipCode')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'rgb(var(--color-primary-600))' }}
                        >
                            {t('state')}
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
                    {addresses.map((addr) => (
                        <tr key={addr.id} className="hover:bg-primary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${addr.is_main ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {t(`types.${addr.type}`)}
                                    </span>
                                    {addr.is_main && (
                                        <StarIconSolid className="h-4 w-4 text-yellow-400" title={t('isMain')} />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {addr.street} {addr.exterior_number} {addr.interior_number && `- ${addr.interior_number}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {addr.neighborhood}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {addr.zip_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {addr.city}, {addr.state}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <Btn
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(addr)}
                                        leftIcon={<PencilIcon className="h-4 w-4" />}
                                        title={tCommon('actions.edit')}
                                    />
                                    <Btn
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(addr.id)}
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
