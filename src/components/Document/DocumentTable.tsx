import { useTranslations, useLocale } from 'next-intl';
import { PencilIcon, TrashIcon, DocumentIcon, CheckBadgeIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { EmployeeDocument } from '@/types/employee';
import { API_BASE_URL } from "@/lib/config";
import { Btn } from "@/components/atoms";
import Tooltip from "@/components/atoms/Tooltip";

interface DocumentTableProps {
  documents: EmployeeDocument[];
  onEdit: (document: EmployeeDocument) => void;
  onDelete: (document: EmployeeDocument) => void;
  onVerify: (document: EmployeeDocument) => void;
  visibleColumns?: string[];
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  onSelectAllChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DocumentTable({
  documents,
  onEdit,
  onDelete,
  onVerify,
  visibleColumns,
  selectedIds = [],
  onSelectChange,
  onSelectAllChange
}: DocumentTableProps) {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  
  const translations = {
    es: {
      employee: "Empleado",
      title: "Título",
      type: "Tipo",
      expiry: "Vencimiento",
      status: "Estado",
      verified: "Verificado",
      pending: "Pendiente",
      actions: "Acciones",
      download: "Descargar",
      view: "Ver documento",
      edit: "Editar",
      delete: "Eliminar",
      verify: "Verificar"
    },
    en: {
      employee: "Employee",
      title: "Title",
      type: "Type",
      expiry: "Expiry",
      status: "Status",
      verified: "Verified",
      pending: "Pending",
      actions: "Actions",
      download: "Download",
      view: "View document",
      edit: "Edit",
      delete: "Delete",
      verify: "Verify"
    },
    zh: {
      employee: "员工",
      title: "标题",
      type: "类型",
      expiry: "有效期",
      status: "状态",
      verified: "已验证",
      pending: "待定",
      actions: "操作",
      download: "下载",
      view: "查看文档",
      edit: "编辑",
      delete: "删除",
      verify: "验证"
    }
  };

  const t = (key: string) => {
    return (translations[locale] as any)[key] || key;
  };

  const { can } = usePermissions();

  if (!Array.isArray(documents)) {
    return null;
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.includes(key);
  };

  const getFileUrl = (path: string, download = false) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    let url = `${API_BASE_URL}${path}`;
    if (download) {
      url += (url.includes('?') ? '&' : '?') + 'download=true';
    }
    return url;
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px rgba(var(--color-primary-500), 0.1), 0 2px 4px -1px rgba(var(--color-primary-500), 0.06)`
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                  checked={documents.length > 0 && selectedIds.length === documents.length}
                  onChange={onSelectAllChange}
                />
              </th>
              {isVisible('employee') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('employee')}
                </th>
              )}
              {isVisible('title') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('title')}
                </th>
              )}
              {isVisible('document_type') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('type')}
                </th>
              )}
              {isVisible('expiry_date') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('expiry')}
                </th>
              )}
              {isVisible('is_verified') && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-600">
                  {t('status')}
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className={`hover:bg-primary-50 transition-colors ${selectedIds.includes(doc.id) ? 'bg-primary-50' : ''}`}>
                <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => onSelectChange && onSelectChange(doc.id)}
                  />
                </td>
                {isVisible('employee') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {doc.employee ? `${doc.employee.first_name} ${doc.employee.last_name}` : '-'}
                  </td>
                )}
                {isVisible('title') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <DocumentIcon className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span>{doc.title}</span>
                        {doc.file_path && (
                          <div className="flex gap-2 mt-1">
                            <a
                              href={getFileUrl(doc.file_path)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 font-normal"
                            >
                              <EyeIcon className="h-3 w-3" />
                              {t('view')}
                            </a>
                            <a
                              href={getFileUrl(doc.file_path, true)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 font-normal"
                            >
                              <ArrowDownTrayIcon className="h-3 w-3" />
                              {t('download')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                )}
                {isVisible('document_type') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.document_type}
                  </td>
                )}
                {isVisible('expiry_date') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : '-'}
                  </td>
                )}
                {isVisible('is_verified') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.is_verified ? t('verified') : t('pending')}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {!doc.is_verified && can(["hr_document_update"]) && (
                      <Tooltip content={t('verify')} placement="top">
                        <Btn
                          onClick={() => onVerify(doc)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<CheckBadgeIcon className="h-4 w-4" />}
                          style={{ color: "#10b981" }}
                        />
                      </Tooltip>
                    )}
                    {can(["hr_document_update"]) && (
                      <Tooltip content={t('edit')} placement="top">
                        <Btn
                          onClick={() => onEdit(doc)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                        />
                      </Tooltip>
                    )}
                    {can(["hr_document_delete"]) && (
                      <Tooltip content={t('delete')} placement="top">
                        <Btn
                          onClick={() => onDelete(doc)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<TrashIcon className="h-4 w-4" />}
                          style={{ color: "#dc2626" }}
                        />
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
