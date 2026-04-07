import { API_BASE_URL } from '@/lib/config';

export interface ImportLog {
  id: string;
  type: 'client' | 'product';
  status: 'pending' | 'completed' | 'failed';
  total_rows: number;
  created_count: number;
  skipped_count: number;
  error_count: number;
  pack_synced: number;
  pack_failed: number;
  summary: string | null;
  errors: any[] | null;
  pack_warnings: any[] | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ClientImportResult {
  created: number;
  skipped: number;
  pack_synced: number;
  pack_failed: number;
  errors: { row: number; code: string; name: string; reason: string }[];
  pack_warnings: { code: string; name: string; reason: string }[];
  summary: string;
}

const CLIENT_FIELDS = [
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
  ['CLI001', 'Juan Pérez', 'Cliente frecuente', '+52 555 123 4567', 'juan@email.com', 'true',
   'PEPJ800101AAA', 'Juan Pérez', '616', 'G03', '85900', 'Av. Principal 123', 'Hermosillo', 'Sonora', 'MEX'],
  ['CLI002', 'Empresa XYZ S.A.', 'Distribuidora', '+52 555 987 6543', 'contacto@xyz.com', 'true',
   'EXY010101AAA', 'Empresa XYZ S.A. de C.V.', '601', 'G01', '06600', 'Insurgentes Sur 1234', 'CDMX', 'CDMX', 'MEX'],
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

class ClientImportService {
  async importCSV(file: File): Promise<ClientImportResult | { status: string; total: number; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/clients/import/csv`, {
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
    const res = await fetch(`${API_BASE_URL}/api/clients/import/history?limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }

  downloadTemplate(locale: string = 'es') {
    const req = REQ_LABEL[locale] || REQ_LABEL.es;
    const opt = OPT_LABEL[locale] || OPT_LABEL.es;
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;

    const headerRow = CLIENT_FIELDS.map(f => q(f.name)).join(',');
    const reqRow    = CLIENT_FIELDS.map(f => q(f.req ? req : opt)).join(',');
    const ex1       = CLIENT_FIELDS.map((_, i) => q(EXAMPLES[0][i] ?? '')).join(',');
    const ex2       = CLIENT_FIELDS.map((_, i) => q(EXAMPLES[1][i] ?? '')).join(',');

    const csv = [headerRow, reqRow, ex1, ex2].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_clientes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const clientImportService = new ClientImportService();
