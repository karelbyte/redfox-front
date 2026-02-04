import { useTranslations } from 'next-intl';
import { Client } from "@/types/client";
import { PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  visibleColumns?: string[];
}

export default function ClientTable({ clients, onEdit, onDelete, visibleColumns }: ClientTableProps) {
  const t = useTranslations('pages.clients');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
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
            <tr key={client.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.code}
                </td>
              )}
              {isVisible('name') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center gap-1.5">
                    {client.pack_client_id && (
                      <span title={t('table.inPack')} className="inline-flex">
                        <CheckCircleIcon
                          className="h-4 w-4 shrink-0 text-green-600"
                          aria-label={t('table.inPack')}
                        />
                      </span>
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
                  <div className="flex justify-end space-x-2">
                    {can(['client_update']) && <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(client)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      title={tCommon('actions.edit')}
                    />}
                    {can(['client_delete']) && <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(client)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      title={tCommon('actions.delete')}
                      style={{ color: '#dc2626' }}
                    />}
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
