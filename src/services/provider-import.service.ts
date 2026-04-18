import { API_BASE_URL } from '@/lib/config';
import type { ImportLog } from './client-import.service';

export type { ImportLog };

const FIELDS = [
  { name: 'code',            req: true  },
  { name: 'name',            req: true  },
  { name: 'description',     req: false },
  { name: 'phone',           req: false },
  { name: 'email',           req: false },
  { name: 'status',          req: false },
  { name: 'tax_document',    req: false },
  { name: 'tax_name',        req: false },
  { name: 'tax_system',      req: false },
  { name: 'invoice_use',     req: false },
  { name: 'address_zip',     req: false },
  { name: 'address_street',  req: false },
  { name: 'address_city',    req: false },
  { name: 'address_state',   req: false },
  { name: 'address_country', req: false },
];

const REQ_LABEL: Record<string, string> = { es: 'REQUERIDO', en: 'REQUIRED', zh: '必填' };
const OPT_LABEL: Record<string, string> = { es: 'opcional',  en: 'optional',  zh: '可选' };

const EXAMPLES = [
  ['PROV001', 'Distribuidora ABC S.A.', 'Proveedor de lácteos', '+52 555 123 4567', 'contacto@abc.com', 'true',
   'ABC010101AAA', 'Distribuidora ABC S.A. de C.V.', '601', 'G03', '85900', 'Blvd. Industrial 456', 'Hermosillo', 'Sonora', 'MEX'],
  ['PROV002', 'Servicios Logísticos XYZ', 'Transporte y logística', '+52 555 987 6543', 'logistica@xyz.com', 'true',
   'SLX010101BBB', 'Servicios Logísticos XYZ S.A.', '612', 'G01', '06600', 'Insurgentes Sur 789', 'CDMX', 'CDMX', 'MEX'],
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

class ProviderImportService {
  async importCSV(file: File): Promise<{ status: string; total: number; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/providers/import/csv`, {
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
    const res = await fetch(`${API_BASE_URL}/api/providers/import/history?limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }

  downloadTemplate(locale: string = 'es') {
    const req = REQ_LABEL[locale] || REQ_LABEL.es;
    const opt = OPT_LABEL[locale] || OPT_LABEL.es;
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;

    const headerRow = FIELDS.map(f => q(f.name)).join(',');
    const reqRow    = FIELDS.map(f => q(f.req ? req : opt)).join(',');
    const ex1       = FIELDS.map((_, i) => q(EXAMPLES[0][i] ?? '')).join(',');
    const ex2       = FIELDS.map((_, i) => q(EXAMPLES[1][i] ?? '')).join(',');

    const csv = headerRow;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_proveedores.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const providerImportService = new ProviderImportService();
