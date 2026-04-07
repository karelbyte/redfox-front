import { API_BASE_URL } from '@/lib/config';
import type { ImportLog } from './client-import.service';

export type { ImportLog };

export interface ImportResult {
  created: number;
  skipped: number;
  errors: { row: number; sku: string; name: string; reason: string }[];
  warnings: { row: number; sku: string; name: string; field: string; reason: string }[];
  summary: string;
}

const FIELDS = [
  { name: 'name',               req: true  },
  { name: 'sku',                req: true  },
  { name: 'code',               req: true  },
  { name: 'measurement_unit',   req: true  },
  { name: 'description',        req: false },
  { name: 'base_price',         req: false },
  { name: 'type',               req: false },
  { name: 'inventory_strategy', req: false },
  { name: 'brand',              req: false },
  { name: 'category',           req: false },
  { name: 'barcode',            req: false },
  { name: 'min_stock',          req: false },
  { name: 'weight',             req: false },
  { name: 'width',              req: false },
  { name: 'height',             req: false },
  { name: 'length',             req: false },
];

const REQ_LABEL: Record<string, string> = {
  es: 'REQUERIDO',
  en: 'REQUIRED',
  zh: '必填',
};
const OPT_LABEL: Record<string, string> = {
  es: 'opcional',
  en: 'optional',
  zh: '可选',
};

const EXAMPLES = [
  ['Leche Entera 1L', 'LECH-001', '50211503', 'LTR', 'Leche entera pasteurizada 1 litro', '25.00', 'tangible', 'average', 'Lala', 'Lácteos', '7501055300018', '10', '1.0', '0.10', '0.25', '0.10'],
  ['Servicio de Instalación', 'SERV-001', '81111500', 'E48', 'Servicio técnico de instalación', '500.00', 'service', 'average', '', 'Servicios', '', '0', '', '', '', ''],
];

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const segments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
  const locales = ['es', 'en', 'zh'];
  const firstIsLocale = locales.includes(segments[0]);
  const tenant = firstIsLocale ? null : segments[0];
  const locale = firstIsLocale ? segments[0] : (segments[1] || 'es');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (tenant) headers['X-Tenant-Slug'] = tenant;
  headers['X-Locale'] = locale;
  return headers;
}

class ProductImportService {
  async importCSV(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/products/import/csv`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al importar');
    }
    return res.json();
  }

  async getHistory(limit = 10): Promise<ImportLog[]> {
    const res = await fetch(`${API_BASE_URL}/api/products/import/history?limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }

  downloadTemplate(locale: string = 'es') {
    const req = REQ_LABEL[locale] || REQ_LABEL.es;
    const opt = OPT_LABEL[locale] || OPT_LABEL.es;
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;

    const headerRow  = FIELDS.map(f => q(f.name)).join(',');
    const reqRow     = FIELDS.map(f => q(f.req ? req : opt)).join(',');
    const example1   = FIELDS.map((_, i) => q(EXAMPLES[0][i] ?? '')).join(',');
    const example2   = FIELDS.map((_, i) => q(EXAMPLES[1][i] ?? '')).join(',');

    const csv = [headerRow, reqRow, example1, example2].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const productImportService = new ProductImportService();
