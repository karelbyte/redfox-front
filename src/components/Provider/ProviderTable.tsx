import { useTranslations } from 'next-intl';
import { Provider } from "@/types/provider";
import { PencilIcon, TrashIcon, MapPinIcon, IdentificationIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter, useParams } from 'next/navigation';

interface ProviderTableProps {
  providers: Provider[];
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProviderTable({
  providers,
  onEdit,
  onDelete,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: ProviderTableProps) {
  const t = useTranslations('pages.providers');
  const tCommon = useTranslations('common');
  const tOffline = useTranslations('offline');
  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;

  if (!Array.isArray(providers)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

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
            <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                checked={providers.length > 0 && selectedIds.length === providers.length}
                onChange={onSelectAllChange}
              />
            </th>
            {isVisible('code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.code')}
              </th>
            )}
            {isVisible('name') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.name')}
              </th>
            )}
            {isVisible('description') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.description')}
              </th>
            )}
            {isVisible('email') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.email')}
              </th>
            )}
            {isVisible('status') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.status')}
              </th>
            )}
            {isVisible('actions') && (
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {providers.map((provider) => (
            <tr key={provider.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(provider.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                {selectedIds.includes(provider.id) && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                )}
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(provider.id)}
                  onChange={() => onSelectChange && onSelectChange(provider.id)}
                />
              </td>
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {provider.code}
                </td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{provider.name}</span>
                    {provider.id.startsWith('temp_') && (
                      <span 
                        className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                        title={tOffline('pendingSync')}
                      >
                        <ClockIcon className="h-3 w-3" />
                        {tOffline('pendingSync')}
                      </span>
                    )}
                  </div>
                </td>
              )}
              {isVisible('description') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {provider.description}
                </td>
              )}
              {isVisible('email') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {provider.email}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${provider.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {provider.status ? tCommon('status.active') : tCommon('status.inactive')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(['provider_update']) && (
                      <>
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/dashboard/proveedores/${provider.id}/direcciones`)}
                          leftIcon={<MapPinIcon className="h-4 w-4" />}
                          title={t('addresses.title')}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/dashboard/proveedores/${provider.id}/datos-fiscales`)}
                          leftIcon={<IdentificationIcon className="h-4 w-4" />}
                          title={t('taxData.title')}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/dashboard/proveedores/${provider.id}/credito`)}
                          leftIcon={<BanknotesIcon className="h-4 w-4" />}
                          title={t('credit.title')}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(provider)}
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                          title={tCommon('actions.edit')}
                        />
                      </>
                    )}
                    {can(['provider_delete']) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(provider)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={tCommon('actions.delete')}
                        style={{ color: '#dc2626' }}
                      />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
