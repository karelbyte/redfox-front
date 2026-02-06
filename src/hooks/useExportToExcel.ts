import { useCallback } from 'react';
import { exportService, ExportOptions } from '@/services/export.service';
import { toastService } from '@/services/toast.service';

export function useExportToExcel<T extends Record<string, any>>() {
  const exportExcel = useCallback(
    (data: T[], options: ExportOptions = {}) => {
      try {
        exportService.exportToExcel(data, options);
        toastService.success('Exported to Excel successfully');
      } catch (error) {
        console.error('Export error:', error);
        toastService.error('Error exporting to Excel');
      }
    },
    []
  );

  const exportCSV = useCallback(
    (data: T[], filename: string = 'export.csv', columns?: string[]) => {
      try {
        exportService.exportToCSV(data, filename, columns);
        toastService.success('Exported to CSV successfully');
      } catch (error) {
        console.error('Export error:', error);
        toastService.error('Error exporting to CSV');
      }
    },
    []
  );

  const exportJSON = useCallback(
    (data: T[], filename: string = 'export.json') => {
      try {
        exportService.exportToJSON(data, filename);
        toastService.success('Exported to JSON successfully');
      } catch (error) {
        console.error('Export error:', error);
        toastService.error('Error exporting to JSON');
      }
    },
    []
  );

  return { exportExcel, exportCSV, exportJSON };
}
