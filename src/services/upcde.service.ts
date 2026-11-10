import { API_BASE_URL } from '@/lib/config';

export const UPCDE_MAX_CONTENT = 200_000;

function getHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const segments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
  const locales = ['es', 'en', 'zh'];
  const firstIsLocale = locales.includes(segments[0]);
  const tenant = firstIsLocale ? null : segments[0];
  const locale = firstIsLocale ? segments[0] : segments[1] || 'es';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (tenant) headers['X-Tenant-Slug'] = tenant;
  headers['X-Locale'] = locale;
  return headers;
}

export interface UpcdeEditor {
  id: string;
  name: string;
  clientId?: string;
}

export interface UpcdeRoom {
  code: string;
  title: string;
  language: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: UpcdeEditor | null;
  viewers: number;
  expiresAt: string;
}

export type UpcdeEvent =
  | { type: 'snapshot' | 'update'; room: UpcdeRoom }
  | { type: 'presence'; viewers: number }
  | { type: 'ping'; at: number }
  | { type: 'closed'; reason: string };

export type UpcdeConnectionStatus =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'offline';

async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({}));
  const message = err?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}

class UpcdeService {
  async createRoom(input: {
    title?: string;
    language?: string;
    content?: string;
    clientId?: string;
    editorName?: string;
  }): Promise<UpcdeRoom> {
    const res = await fetch(`${API_BASE_URL}/api/upcde/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(await parseError(res, 'No se pudo crear la sala'));
    }

    return res.json();
  }

  async getRoom(code: string, signal?: AbortSignal): Promise<UpcdeRoom> {
    const res = await fetch(
      `${API_BASE_URL}/api/upcde/rooms/${encodeURIComponent(code)}`,
      { headers: getHeaders(), cache: 'no-store', signal },
    );

    if (!res.ok) {
      throw new Error(await parseError(res, 'No se pudo abrir la sala'));
    }

    return res.json();
  }

  async updateRoom(
    code: string,
    changes: { content?: string; language?: string; title?: string },
    clientId?: string,
    editorName?: string,
  ): Promise<UpcdeRoom> {
    const res = await fetch(
      `${API_BASE_URL}/api/upcde/rooms/${encodeURIComponent(code)}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...changes, clientId, editorName }),
      },
    );

    if (!res.ok) {
      throw new Error(await parseError(res, 'No se pudo sincronizar el código'));
    }

    return res.json();
  }

  async deleteRoom(code: string): Promise<{ success: boolean }> {
    const res = await fetch(
      `${API_BASE_URL}/api/upcde/rooms/${encodeURIComponent(code)}`,
      { method: 'DELETE', headers: getHeaders() },
    );

    if (!res.ok) {
      throw new Error(await parseError(res, 'No se pudo cerrar la sala'));
    }

    return res.json();
  }

  subscribe(
    code: string,
    handlers: {
      onEvent?: (event: UpcdeEvent) => void;
      onStatus?: (status: UpcdeConnectionStatus) => void;
      onClosed?: (reason: string) => void;
    },
  ): () => void {
    let closed = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retry = 0;

    const connect = async () => {
      if (closed) return;
      controller = new AbortController();
      handlers.onStatus?.(retry === 0 ? 'connecting' : 'reconnecting');

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/upcde/rooms/${encodeURIComponent(code)}/events`,
          {
            headers: getHeaders(),
            signal: controller.signal,
            cache: 'no-store',
          },
        );

        if (!res.ok) {
          if ([401, 403, 404].includes(res.status)) {
            handlers.onStatus?.('offline');
            handlers.onClosed?.(
              res.status === 404 ? 'not_found' : 'forbidden',
            );
            return;
          }
          throw new Error(`SSE ${res.status}`);
        }

        if (!res.body) throw new Error('SSE sin cuerpo');

        retry = 0;
        handlers.onStatus?.('live');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!closed) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let separator = buffer.indexOf('\n\n');
          while (separator !== -1) {
            const raw = buffer.slice(0, separator);
            buffer = buffer.slice(separator + 2);
            separator = buffer.indexOf('\n\n');

            const payload = raw
              .split('\n')
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trimStart())
              .join('\n');

            if (!payload) continue;

            let event: UpcdeEvent;
            try {
              event = JSON.parse(payload) as UpcdeEvent;
            } catch {
              continue;
            }

            handlers.onEvent?.(event);

            if (event.type === 'closed') {
              closed = true;
              handlers.onClosed?.(event.reason);
              controller?.abort();
              return;
            }
          }
        }

        if (closed) return;
        throw new Error('SSE finalizado');
      } catch {
        if (closed || controller?.signal.aborted) return;
        retry += 1;
        handlers.onStatus?.('reconnecting');
        const delay = Math.min(1000 * retry, 5000);
        retryTimer = setTimeout(connect, delay);
      }
    };

    void connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      controller?.abort();
    };
  }
}

export const upcdeService = new UpcdeService();
