import { useTranslations } from 'next-intl';
import { Brand } from '@/types/brand';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Btn } from "@/components/atoms";
import { usePermissions } from '@/hooks/usePermissions';

interface BrandTableProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  visibleColumns?: string[];
}

export default function BrandTable({ brands, onEdit, onDelete, visibleColumns }: BrandTableProps) {
  const t = useTranslations('pages.brands');
  const commonT = useTranslations('common');
  const { can } = usePermissions();

  if (!Array.isArray(brands)) {
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
            {isVisible('code') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('form.code')}
              </th>
            )}
            {isVisible('description') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('form.description')}
              </th>
            )}
            {isVisible('image') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('form.image')}
              </th>
            )}
            {isVisible('status') && (
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: `rgb(var(--color-primary-600))` }}
              >
                {t('form.status')}
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
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-primary-50 transition-colors">
              {isVisible('code') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{brand.code}</td>
              )}
              {isVisible('description') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{brand.description}</td>
              )}
              {isVisible('image') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {brand.img && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL_API}${brand.img}`}
                      alt={brand.code}
                      width={80}
                      height={80}
                      className="object-contain rounded-lg border border-gray-200"
                    />
                  )}
                </td>
              )}
              {isVisible('status') && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {brand.isActive ? commonT('status.active') : commonT('status.inactive')}
                  </span>
                </td>
              )}
              {isVisible('actions') && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {can(['brand_update']) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(brand)}
                        leftIcon={<PencilIcon className="h-4 w-4" />}
                        title={commonT('actions.edit')}
                      />
                    )}
                    {can(['brand_delete']) && (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(brand)}
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        title={commonT('actions.delete')}
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
