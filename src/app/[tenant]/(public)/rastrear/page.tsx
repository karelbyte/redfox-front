'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/config';

const STATUS_LABELS: Record<string, Record<string, string>> = {
  PENDING:   { es: 'Pendiente',   en: 'Pending',    zh: '待处理' },
  PACKING:   { es: 'Empacando',   en: 'Packing',    zh: '包装中' },
  SHIPPED:   { es: 'En camino',   en: 'In transit', zh: '运送中' },
  DELIVERED: { es: 'Entregado',   en: 'Delivered',  zh: '已送达' },
  RETURNED:  { es: 'Devuelto',    en: 'Returned',   zh: '已退回' },
  FAILED:    { es: 'Fallido',     en: 'Failed',     zh: '失败'   },
};

const STATUS_STEPS = ['PENDING', 'PACKING', 'SHIPPED', 'DELIVERED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PACKING:   'bg-orange-100 text-orange-800',
  SHIPPED:   'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  RETURNED:  'bg-red-100 text-red-800',
  FAILED:    'bg-red-100 text-red-800',
};

interface OrgBranding {
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

interface TrackResult {
  tracking_number: string;
  carrier: string;
  status: string;
  tracking_url?: string;
  estimated_delivery_date?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  organization: OrgBranding;
  created_at: string;
  updated_at: string;
}

const T = {
  es: {
    title: 'Rastrear Envío',
    subtitle: 'Ingresa tu número de guía para conocer el estado de tu pedido',
    placeholder: 'Número de guía',
    search: 'Rastrear',
    searching: 'Buscando...',
    notFound: 'No se encontró ningún envío con ese número de guía.',
    carrier: 'Paquetería',
    estimated: 'Entrega estimada',
    shippedAt: 'Fecha de envío',
    deliveredAt: 'Fecha de entrega',
    notes: 'Notas',
    trackOnCarrier: 'Rastrear en sitio de paquetería',
    lastUpdate: 'Última actualización',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Correo',
    poweredBy: 'Powered by Nitro POS',
  },
  en: {
    title: 'Track Shipment',
    subtitle: 'Enter your tracking number to check your order status',
    placeholder: 'Tracking number',
    search: 'Track',
    searching: 'Searching...',
    notFound: 'No shipment found with that tracking number.',
    carrier: 'Carrier',
    estimated: 'Estimated delivery',
    shippedAt: 'Shipped on',
    deliveredAt: 'Delivered on',
    notes: 'Notes',
    trackOnCarrier: 'Track on carrier website',
    lastUpdate: 'Last update',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    poweredBy: 'Powered by Nitro POS',
  },
  zh: {
    title: '追踪包裹',
    subtitle: '输入运单号查询您的订单状态',
    placeholder: '运单号',
    search: '查询',
    searching: '查询中...',
    notFound: '未找到该运单号对应的包裹。',
    carrier: '承运商',
    estimated: '预计送达',
    shippedAt: '发货时间',
    deliveredAt: '送达时间',
    notes: '备注',
    trackOnCarrier: '在承运商网站追踪',
    lastUpdate: '最后更新',
    address: '地址',
    phone: '电话',
    email: '邮箱',
    poweredBy: 'Powered by Nitro POS',
  },
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TrackPage() {
  const params = useParams();
  const tenant = params?.tenant as string;

  const [lang] = useState<'es' | 'en' | 'zh'>(() => {
    if (typeof window === 'undefined') return 'es';
    const nav = navigator.language || 'es';
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('en')) return 'en';
    return 'es';
  });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState<OrgBranding | null>(null);

  const t = T[lang];

  useEffect(() => {
    if (!tenant) return;
    fetch(`${API_BASE_URL}/api/public/org/${tenant}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setBranding(data); })
      .catch(() => {});
  }, [tenant]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/track/${encodeURIComponent(query.trim())}?tenant=${tenant}`,
      );
      if (!res.ok) { setError(t.notFound); return; }
      setResult(await res.json());
    } catch {
      setError(t.notFound);
    } finally {
      setLoading(false);
    }
  };

  const org = result?.organization || branding;
  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          {org?.logo_url ? (
            <Image
              src={`${API_BASE_URL}${org.logo_url}`}
              alt={org.name}
              width={120}
              height={48}
              className="object-contain h-12 w-auto"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
              {org?.name?.[0] || '?'}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-gray-900">{org?.name || '...'}</p>
            {org?.legal_name && <p className="text-xs text-gray-400">{org.legal_name}</p>}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-lg text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t.searching : t.search}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{t.carrier}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-0.5">{result.carrier}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{result.tracking_number}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[result.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[result.status]?.[lang] || result.status}
                  </span>
                </div>
              </div>

              {STATUS_STEPS.includes(result.status) && (
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    {STATUS_STEPS.map((step, idx) => (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${idx <= stepIndex ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {idx < stepIndex ? '✓' : idx + 1}
                        </div>
                        <p className={`text-xs mt-1 text-center ${idx <= stepIndex ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                          {STATUS_LABELS[step]?.[lang]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-3 mx-4">
                    <div className="h-1 bg-gray-100 rounded-full" />
                    <div
                      className="absolute top-0 left-0 h-1 rounded-full bg-gray-800 transition-all"
                      style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              )}

              <div className="px-6 py-5 space-y-3">
                {result.estimated_delivery_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.estimated}</span>
                    <span className="font-medium text-gray-800">{formatDate(result.estimated_delivery_date)}</span>
                  </div>
                )}
                {result.shipped_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.shippedAt}</span>
                    <span className="font-medium text-gray-800">{formatDate(result.shipped_at)}</span>
                  </div>
                )}
                {result.delivered_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.deliveredAt}</span>
                    <span className="font-medium text-gray-800">{formatDate(result.delivered_at)}</span>
                  </div>
                )}
                {result.notes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.notes}</span>
                    <span className="font-medium text-gray-800 text-right max-w-xs">{result.notes}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.lastUpdate}</span>
                  <span className="text-gray-400 text-xs">{formatDate(result.updated_at)}</span>
                </div>
              </div>

              {result.tracking_url && (
                <div className="px-6 pb-5">
                  <a
                    href={result.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t.trackOnCarrier} →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          {org && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-gray-500">
              <div className="space-y-1">
                {org.address && (
                  <p className="flex items-center gap-1.5">
                    <span className="text-gray-400">📍</span> {org.address}
                  </p>
                )}
                {org.phone && (
                  <p className="flex items-center gap-1.5">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${org.phone}`} className="hover:text-gray-700">{org.phone}</a>
                  </p>
                )}
                {org.email && (
                  <p className="flex items-center gap-1.5">
                    <span className="text-gray-400">✉️</span>
                    <a href={`mailto:${org.email}`} className="hover:text-gray-700">{org.email}</a>
                  </p>
                )}
                {org.website && (
                  <p className="flex items-center gap-1.5">
                    <span className="text-gray-400">🌐</span>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">{org.website}</a>
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-300 shrink-0">{t.poweredBy}</p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
