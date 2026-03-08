'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { auditLogsService, AuditLog, AuditAction } from '@/services/audit-logs.service';
import { toastService } from '@/services/toast.service';
import { SearchInput, EmptyState } from '@/components/atoms';
import AdvancedFilters from '@/components/atoms/AdvancedFilters';
import ExportButton from '@/components/atoms/ExportButton';
import Pagination from '@/components/Pagination/Pagination';
import Loading from '@/components/Loading/Loading';
import { usePermissions } from '@/hooks/usePermissions';

const ACTION_COLORS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'bg-green-100 text-green-800',
  [AuditAction.UPDATE]: 'bg-blue-100 text-blue-800',
  [AuditAction.DELETE]: 'bg-red-100 text-red-800',
  [AuditAction.RESTORE]: 'bg-yellow-100 text-yellow-800',
  [AuditAction.EXPORT]: 'bg-purple-100 text-purple-800',
  [AuditAction.IMPORT]: 'bg-indigo-100 text-indigo-800',
};

const ACTION_LABELS: Record<AuditAction, { es: string; en: string }> = {
  [AuditAction.CREATE]: { es: 'Crear', en: 'Create' },
  [AuditAction.UPDATE]: { es: 'Actualizar', en: 'Update' },
  [AuditAction.DELETE]: { es: 'Eliminar', en: 'Delete' },
  [AuditAction.RESTORE]: { es: 'Restaurar', en: 'Restore' },
  [AuditAction.EXPORT]: { es: 'Exportar', en: 'Export' },
  [AuditAction.IMPORT]: { es: 'Importar', en: 'Import' },
};

export default function AuditLogsPage() {
  const t = useTranslations('pages.auditLogs');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Check permissions
  if (!can(['audit_log_module_view'])) {
    return (
      <div className="p-6">
        <EmptyState
          title={tCommon('noPermission')}
          description={tCommon('noPermissionDescription')}
        />
      </div>
    );
  }

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const fetchLogs = async (page: number, term?: string, currentFilters?: Record<string, any>) => {
    try {
      setLoading(true);
      const activeFilters = currentFilters || filters;
      
      const response = await auditLogsService.getAll(page, 50, {
        entityType: activeFilters.entityType,
        action: activeFilters.action,
        userId: activeFilters.userId,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      });
      
      setLogs(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLogs(page, searchTerm, filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Filtros */}
      {logs.length > 0 && (
        <div className="mb-6 flex justify-end items-center gap-3">
          {can(['audit_log_export']) && (
            <ExportButton
              data={logs}
              filename="audit-logs"
              columns={['action', 'entityType', 'entityId', 'user', 'created_at']}
            >
            </ExportButton>
          )}
          <AdvancedFilters
            fields={[
              {
                key: 'action',
                label: t('filters.action'),
                type: 'select',
                options: [
                  { value: AuditAction.CREATE, label: ACTION_LABELS[AuditAction.CREATE].es },
                  { value: AuditAction.UPDATE, label: ACTION_LABELS[AuditAction.UPDATE].es },
                  { value: AuditAction.DELETE, label: ACTION_LABELS[AuditAction.DELETE].es },
                  { value: AuditAction.RESTORE, label: ACTION_LABELS[AuditAction.RESTORE].es },
                  { value: AuditAction.EXPORT, label: ACTION_LABELS[AuditAction.EXPORT].es },
                  { value: AuditAction.IMPORT, label: ACTION_LABELS[AuditAction.IMPORT].es },
                ],
              },
              {
                key: 'entityType',
                label: t('filters.entityType'),
                type: 'text',
              },
              {
                key: 'startDate',
                label: t('filters.startDate'),
                type: 'date',
              },
              {
                key: 'endDate',
                label: t('filters.endDate'),
                type: 'date',
              },
            ]}
            onApply={(newFilters) => {
              setFilters(newFilters);
              fetchLogs(1, searchTerm, newFilters);
            }}
            storageKey="audit-logs-filters"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('empty.title')}
          description={t('empty.description')}
          searchDescription={t('empty.noResults')}
        />
      ) : (
        <>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.date')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.action')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.entity')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.user')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.description')}
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      {t('table.details')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-primary-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ACTION_COLORS[log.action]}`}>
                            {ACTION_LABELS[log.action].es}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{log.entityType}</div>
                            <div className="text-xs text-gray-500">{log.entityId.slice(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{log.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {(log.oldValues || log.newValues) && (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              {expandedLog === log.id ? t('table.hideDetails') : t('table.showDetails')}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                              {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('table.oldValues')}
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                                    {JSON.stringify(log.oldValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValues && Object.keys(log.newValues).length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('table.newValues')}
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                                    {JSON.stringify(log.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                            {log.ipAddress && (
                              <div className="mt-3 text-xs text-gray-500">
                                IP: {log.ipAddress}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
