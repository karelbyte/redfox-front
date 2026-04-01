import { useTranslations } from 'next-intl';
import { Client } from "@/types/client";
import { PencilIcon, TrashIcon, CheckCircleIcon, MapPinIcon, IdentificationIcon, BanknotesIcon, ShoppingCartIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ActionsMenu, { ActionMenuItem } from "@/components/atoms/ActionsMenu";
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter, useParams } from 'next/navigation';
import Tooltip from '@/components/atoms/Tooltip';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onSync?: (client: Client) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ClientTable({
  clients,
  onEdit,
  onDelete,
  onSync,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: ClientTableProps) {
  const t = useTranslations('pages.clients');
  const tCredit = useTranslations('pages.clients.credit');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const locale = params?.locale as string || 'es';
  if (!Array.isArray(clients)) {
    return null;
  }

  // Helper to check if a column should be visible
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
                checked={clients.length > 0 && selectedIds.length === clients.length}
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
            {isVisible('balance') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.balance')}
              </th>
            )}
            {isVisible('tax_document') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('table.taxDocument')}
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
          {clients.map((client) => (
            <tr key={client.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(client.id) ? 'bg-primary-50' : ''}`}>
              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                {selectedIds.includes(client.id) && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                )}
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={selectedIds.includes(client.id)}
                  onChange={() => onSelectChange && onSelectChange(client.id)}
                />
              </td>
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.code}
                </td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center gap-1.5">
                    {client.pack_client_id && (
                      <Tooltip content={t('table.inPack')} placement="right">
                        <CheckCircleIcon
                          className="h-4 w-4 shrink-0 text-green-600"
                          aria-label={t('table.inPack')}
                        />
                      </Tooltip>
                    )}
                    {client.name}
                  </span>
                </td>
              )}
              {isVisible('description') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.description}
                </td>
              )}
              {isVisible('email') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.email}
                </td>
              )}
              {isVisible('balance') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(client.balance)}
                </td>
              )}
              {isVisible('tax_document') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.tax_document}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {client.status ? tCommon('status.active') : tCommon('status.inactive')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ClientActionsMenu
                    client={client}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSync={onSync}
                    tenant={tenant}
                    locale={locale}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ClientActionsMenuProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onSync?: (client: Client) => void;
  tenant: string;
  locale: string;
}

function ClientActionsMenu({
  client,
  onEdit,
  onDelete,
  onSync,
  tenant,
  locale,
}: ClientActionsMenuProps) {
  const t = useTranslations('pages.clients');
  const tCredit = useTranslations('pages.clients.credit');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const router = useRouter();

  const menuItems: ActionMenuItem[] = [
    ...(can(['client_update'])
      ? [
           ...(can(['client_update']) && onSync
      ? [
          {
            icon: <ArrowPathIcon className="h-4 w-4" />,
            label: t('actions.syncWithPack'),
            color: '#0891b2',
            onClick: () => {
              onSync(client);
            },
          },
        ]
      : []),
          {
            icon: <ShoppingCartIcon className="h-4 w-4" />,
            label: t('actions.viewSales'),
            color: '#059669',
            onClick: () => {
              router.push(`/${tenant}/${locale}/dashboard/clientes/${client.id}/ventas`);
            },
          },
          {
            icon: <MapPinIcon className="h-4 w-4" />,
            label: t('addresses.title'),
            onClick: () => {
              router.push(`/${tenant}/${locale}/dashboard/clientes/${client.id}/direcciones`);
            },
          },
          {
            icon: <IdentificationIcon className="h-4 w-4" />,
            label: t('taxData.title'),
            onClick: () => {
              router.push(`/${tenant}/${locale}/dashboard/clientes/${client.id}/datos-fiscales`);
            },
          },
          {
            icon: <BanknotesIcon className="h-4 w-4" />,
            label: tCredit('title'),
            onClick: () => {
              router.push(`/${tenant}/${locale}/dashboard/clientes/${client.id}/credito`);
            },
          },
          {
            icon: <PencilIcon className="h-4 w-4" />,
            label: tCommon('actions.edit'),
            onClick: () => {
              onEdit(client);
            },
          },
        ]
      : []),
 
    ...(can(['client_delete'])
      ? [
          {
            icon: <TrashIcon className="h-4 w-4" />,
            label: tCommon('actions.delete'),
            color: '#dc2626',
            onClick: () => {
              onDelete(client);
            },
          },
        ]
      : []),
  ];

  return <ActionsMenu items={menuItems} />;
}
