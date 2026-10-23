import { API_BASE_URL } from '@/lib/config';

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

export interface SipUploadResult {
  success: boolean;
  message: string;
  url: string;
  key: string;
  filename: string;
  size: number;
}

class SipService {
  async uploadSip(file: File): Promise<SipUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/sip/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir el SIP');
    }

    return res.json();
  }
}

export const sipService = new SipService();
