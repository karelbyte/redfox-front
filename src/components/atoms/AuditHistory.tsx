'use client';

import { useState, useEffect } from 'react';
import { auditLogsService, AuditLog, AuditAction } from '@/services/audit-logs.service';

interface AuditHistoryProps {
  entityType: string;
  entityId: string;
  className?: string;
}

const ACTION_COLORS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'bg-green-100 text-green-800',
  [AuditAction.UPDATE]: 'bg-blue-100 text-blue-800',
  [AuditAction.DELETE]: 'bg-red-100 text-red-800',
  [AuditAction.RESTORE]: 'bg-yellow-100 text-yellow-800',
  [AuditAction.EXPORT]: 'bg-purple-100 text-purple-800',
  [AuditAction.IMPORT]: 'bg-indigo-100 text-indigo-800',
};

export default function AuditHistory({
  entityType,
  entityId,
  className = '',
}: AuditHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [entityType, entityId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditLogsService.findByEntity(entityType, entityId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading history...</div>;
  }

  if (logs.length === 0) {
    return <div className="text-sm text-gray-500">No changes recorded</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900">Change History</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  ACTION_COLORS[log.action]
                }`}
              >
                {log.action[0]}
              </div>
              {index < logs.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 my-1" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {log.action}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                by {log.user?.name || 'Unknown'}
              </p>
              {log.description && (
                <p className="text-xs text-gray-700 mt-1">{log.description}</p>
              )}
              {log.newValues && Object.keys(log.newValues).length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-primary-600 cursor-pointer hover:text-primary-700">
                    View changes
                  </summary>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                    <pre>
                      {JSON.stringify(log.newValues, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
