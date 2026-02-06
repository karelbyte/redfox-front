import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  columns?: string[];
}

class ExportService {
  exportToExcel<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const {
      filename = 'export.xlsx',
      sheetName = 'Sheet1',
      columns = Object.keys(data[0]),
    } = options;

    // Filtrar datos para incluir solo las columnas especificadas
    const filteredData = data.map(row => {
      const newRow: Record<string, any> = {};
      columns.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });

    // Crear workbook y worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Ajustar ancho de columnas
    const colWidths = columns.map(col => ({
      wch: Math.max(col.length, 15),
    }));
    worksheet['!cols'] = colWidths;

    // Descargar archivo
    XLSX.writeFile(workbook, filename);
  }

  exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string = 'export.csv',
    columns?: string[]
  ): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const cols = columns || Object.keys(data[0]);
    const filteredData = data.map(row => {
      const newRow: Record<string, any> = {};
      cols.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, filename);
  }

  exportToJSON<T extends Record<string, any>>(
    data: T[],
    filename: string = 'export.json'
  ): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  formatDataForExport<T extends Record<string, any>>(
    data: T[],
    formatters?: Record<string, (value: any) => string>
  ): T[] {
    return data.map(row => {
      const newRow = { ...row };
      if (formatters) {
        Object.entries(formatters).forEach(([key, formatter]) => {
          if (key in newRow) {
            newRow[key] = formatter(newRow[key]);
          }
        });
      }
      return newRow;
    });
  }
}

export const exportService = new ExportService();
