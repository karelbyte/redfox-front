'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';
import {
  Code2,
  Copy,
  ExternalLink,
  Hash,
  Loader2,
  LogOut,
  MonitorPlay,
  Pencil,
  Plus,
  Radio,
  Users,
  X,
} from 'lucide-react';
import {
  UPCDE_MAX_CONTENT,
  upcdeService,
  type UpcdeConnectionStatus,
  type UpcdeEvent,
  type UpcdeRoom,
} from '@/services/upcde.service';
import {
  HIGHLIGHT_LANGUAGES,
  highlightCode,
  languageFromFilename,
  normalizeLanguage,
} from '@/lib/syntax-highlight';

const LAST_ROOM_STORAGE = 'upcde:last-room';

function createClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function updateUrlRoomCode(code: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (code) {
    url.searchParams.set('sala', code);
  } else {
    url.searchParams.delete('sala');
  }
  window.history.replaceState({}, '', url.toString());
}

function buildShareLink(code: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('sala', code);
  return url.toString();
}

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

const translations = {
  es: {
    title: 'Upcde',
    subtitle: 'Comparte y visualiza código en vivo entre ventanas y dispositivos',
    adminOnly: 'Solo para administradores',
    createTitle: 'Crear una sala',
    createDesc:
      'Abre una sesión nueva y comparte el enlace o el código con otra ventana o dispositivo.',
    createBtn: 'Crear sala',
    creating: 'Creando...',
    joinTitle: 'Unirse a una sala',
    joinDesc:
      'Pega el código de una sala existente para ver el código en vivo.',
    codePlaceholder: 'CÓDIGO',
    joinBtn: 'Entrar',
    joining: 'Conectando...',
    joined: 'Te uniste a la sala',
    created: 'Sala creada',
    invalidCode: 'Ingresa un código de sala',
    roomNotFound: 'No se encontró la sala o ya expiró',
    roomExpired: 'La sala se cerró o expiró',
    lastRoom: 'Última sala',
    roomLabel: 'Sala',
    copyLink: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyError: 'No se pudo copiar el enlace',
    openWindow: 'Abrir en otra ventana',
    leave: 'Salir',
    closeRoom: 'Cerrar sala',
    confirmLeave:
      '¿Salir de la sala? La sesión seguirá disponible para otros.',
    confirmClose:
      '¿Cerrar la sala para todos? Esta acción no se puede deshacer.',
    closed: 'Sala cerrada',
    closeError: 'No se pudo cerrar la sala',
    statusLive: 'En vivo',
    statusConnecting: 'Conectando',
    statusReconnecting: 'Reconectando',
    statusOffline: 'Sin conexión',
    viewers: (n: number) => `${n} conectado${n === 1 ? '' : 's'}`,
    editorTitle: 'Editor',
    editorHint: 'Pega tu código aquí. Se sincroniza automáticamente.',
    previewTitle: 'Vista de código',
    previewEmpty: 'El código aparecerá aquí en cuanto lo pegues.',
    watchMode: 'Solo vista',
    editMode: 'Mostrar editor',
    updatedBy: (name: string) => `Editado por ${name}`,
    updatedAt: (time: string) => `a las ${time}`,
    saveError: 'No se pudo sincronizar el cambio',
    tooLarge: 'El código supera el máximo de 200 KB',
    dropHint: 'También puedes arrastrar un archivo de código',
    chars: (n: number) => `${n.toLocaleString('es')} caracteres`,
    languageLabel: 'Lenguaje',
    noCodeYet: 'Sin código todavía',
    readOnly: 'Vista en vivo',
  },
  en: {
    title: 'Upcde',
    subtitle: 'Share and watch code live across windows and devices',
    adminOnly: 'Admins only',
    createTitle: 'Create a room',
    createDesc:
      'Open a new session and share the link or code with another window or device.',
    createBtn: 'Create room',
    creating: 'Creating...',
    joinTitle: 'Join a room',
    joinDesc: 'Paste an existing room code to watch the code live.',
    codePlaceholder: 'CODE',
    joinBtn: 'Join',
    joining: 'Connecting...',
    joined: 'You joined the room',
    created: 'Room created',
    invalidCode: 'Enter a room code',
    roomNotFound: 'The room was not found or has expired',
    roomExpired: 'The room was closed or expired',
    lastRoom: 'Last room',
    roomLabel: 'Room',
    copyLink: 'Copy link',
    copied: 'Link copied',
    copyError: 'Could not copy the link',
    openWindow: 'Open in another window',
    leave: 'Leave',
    closeRoom: 'Close room',
    confirmLeave:
      'Leave this room? The session will stay available for others.',
    confirmClose: 'Close the room for everyone? This cannot be undone.',
    closed: 'Room closed',
    closeError: 'Could not close the room',
    statusLive: 'Live',
    statusConnecting: 'Connecting',
    statusReconnecting: 'Reconnecting',
    statusOffline: 'Offline',
    viewers: (n: number) => `${n} connected`,
    editorTitle: 'Editor',
    editorHint: 'Paste your code here. It syncs automatically.',
    previewTitle: 'Code view',
    previewEmpty: 'Your code will appear here as soon as you paste it.',
    watchMode: 'View only',
    editMode: 'Show editor',
    updatedBy: (name: string) => `Edited by ${name}`,
    updatedAt: (time: string) => `at ${time}`,
    saveError: 'Could not sync the change',
    tooLarge: 'Code exceeds the 200 KB limit',
    dropHint: 'You can also drop a code file here',
    chars: (n: number) => `${n.toLocaleString('en')} characters`,
    languageLabel: 'Language',
    noCodeYet: 'No code yet',
    readOnly: 'Live view',
  },
  zh: {
    title: 'Upcde',
    subtitle: '在多个窗口和设备之间实时共享和查看代码',
    adminOnly: '仅限管理员',
    createTitle: '创建房间',
    createDesc: '创建一个新会话，并将链接或房间代码分享到另一个窗口或设备。',
    createBtn: '创建房间',
    creating: '创建中...',
    joinTitle: '加入房间',
    joinDesc: '粘贴现有房间代码以实时查看代码。',
    codePlaceholder: '房间代码',
    joinBtn: '加入',
    joining: '连接中...',
    joined: '已加入房间',
    created: '房间已创建',
    invalidCode: '请输入房间代码',
    roomNotFound: '未找到房间或房间已过期',
    roomExpired: '房间已关闭或已过期',
    lastRoom: '上次房间',
    roomLabel: '房间',
    copyLink: '复制链接',
    copied: '链接已复制',
    copyError: '无法复制链接',
    openWindow: '在新窗口打开',
    leave: '离开',
    closeRoom: '关闭房间',
    confirmLeave: '离开此房间？其他人仍可继续使用该会话。',
    confirmClose: '为所有人关闭此房间？此操作无法撤销。',
    closed: '房间已关闭',
    closeError: '无法关闭房间',
    statusLive: '实时',
    statusConnecting: '连接中',
    statusReconnecting: '重新连接中',
    statusOffline: '离线',
    viewers: (n: number) => `${n} 人在线`,
    editorTitle: '编辑器',
    editorHint: '在此粘贴代码，将自动同步。',
    previewTitle: '代码视图',
    previewEmpty: '粘贴代码后，这里会立即显示。',
    watchMode: '仅查看',
    editMode: '显示编辑器',
    updatedBy: (name: string) => `由 ${name} 编辑`,
    updatedAt: (time: string) => `于 ${time}`,
    saveError: '无法同步更改',
    tooLarge: '代码超过 200 KB 的限制',
    dropHint: '也可以将代码文件拖放到这里',
    chars: (n: number) => `${n.toLocaleString('zh')} 个字符`,
    languageLabel: '语言',
    noCodeYet: '暂无代码',
    readOnly: '实时视图',
  },
} as Record<
  string,
  {
    title: string;
    subtitle: string;
    adminOnly: string;
    createTitle: string;
    createDesc: string;
    createBtn: string;
    creating: string;
    joinTitle: string;
    joinDesc: string;
    codePlaceholder: string;
    joinBtn: string;
    joining: string;
    joined: string;
    created: string;
    invalidCode: string;
    roomNotFound: string;
    roomExpired: string;
    lastRoom: string;
    roomLabel: string;
    copyLink: string;
    copied: string;
    copyError: string;
    openWindow: string;
    leave: string;
    closeRoom: string;
    confirmLeave: string;
    confirmClose: string;
    closed: string;
    closeError: string;
    statusLive: string;
    statusConnecting: string;
    statusReconnecting: string;
    statusOffline: string;
    viewers: (n: number) => string;
    editorTitle: string;
    editorHint: string;
    previewTitle: string;
    previewEmpty: string;
    watchMode: string;
    editMode: string;
    updatedBy: (name: string) => string;
    updatedAt: (time: string) => string;
    saveError: string;
    tooLarge: string;
    dropHint: string;
    chars: (n: number) => string;
    languageLabel: string;
    noCodeYet: string;
    readOnly: string;
  }
>;

type Copy = (typeof translations)[string];

const STATUS_STYLES: Record<
  UpcdeConnectionStatus,
  { dot: string; pill: string }
> = {
  live: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  connecting: {
    dot: 'bg-amber-400 animate-pulse',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  reconnecting: {
    dot: 'bg-amber-400 animate-pulse',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  offline: {
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-700 border-red-200',
  },
};

export default function UpcdePage() {
  const { user, isLoading } = useAuth();
  const locale = useLocale();
  const t = translations[locale] || translations.es;

  const [room, setRoom] = useState<UpcdeRoom | null>(null);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('html');
  const [status, setStatus] = useState<UpcdeConnectionStatus>('offline');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [watchOnly, setWatchOnly] = useState(false);
  const [lastRoom, setLastRoom] = useState<string | null>(null);

  const clientIdRef = useRef('');
  if (!clientIdRef.current && typeof window !== 'undefined') {
    clientIdRef.current = createClientId();
  }
  const codeRef = useRef<string | null>(null);
  const contentRef = useRef('');
  const versionRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const pendingLanguageRef = useRef<string | null>(null);
  const tooLargeWarnedRef = useRef(false);
  const handleEventRef = useRef<(event: UpcdeEvent) => void>(() => undefined);
  const flushUpdateRef = useRef<() => Promise<void>>(async () => undefined);
  const tRef = useRef<Copy>(t);
  const userNameRef = useRef<string>('');

  tRef.current = t;
  userNameRef.current = user?.name || user?.email || '';

  const isAdmin =
    user?.admin ||
    user?.roles?.some(
      (r: any) => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN',
    );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setLastRoom(window.localStorage.getItem(LAST_ROOM_STORAGE));
    } catch {
      // localStorage puede estar deshabilitado
    }
  }, []);

  const applySnapshotContent = useCallback((snapshot: UpcdeRoom) => {
    versionRef.current = snapshot.version;
    contentRef.current = snapshot.content;
    setContent(snapshot.content);
    setLanguage(snapshot.language);
  }, []);

  handleEventRef.current = (event) => {
    if (event.type === 'ping' || event.type === 'closed') return;

    if (event.type === 'presence') {
      setRoom((previous) =>
        previous ? { ...previous, viewers: event.viewers } : previous,
      );
      return;
    }

    const next = event.room;

    if (event.type === 'snapshot') {
      setRoom((previous) =>
        previous
          ? {
              ...previous,
              viewers: next.viewers,
              updatedAt: next.updatedAt,
              updatedBy: next.updatedBy,
            }
          : next,
      );
      if (
        next.version > versionRef.current &&
        pendingContentRef.current === null
      ) {
        applySnapshotContent(next);
      }
      return;
    }

    // event.type === 'update'
    setRoom((previous) =>
      previous
        ? {
            ...previous,
            version: next.version,
            viewers: next.viewers,
            updatedAt: next.updatedAt,
            updatedBy: next.updatedBy,
          }
        : next,
    );

    const isOwnEcho =
      !!next.updatedBy?.clientId &&
      next.updatedBy.clientId === clientIdRef.current;

    if (isOwnEcho) {
      versionRef.current = Math.max(versionRef.current, next.version);
      return;
    }

    if (next.version >= versionRef.current) {
      applySnapshotContent(next);
    }
  };

  const activateRoom = useCallback(
    (snapshot: UpcdeRoom) => {
      unsubscribeRef.current?.();
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      pendingContentRef.current = null;
      pendingLanguageRef.current = null;

      codeRef.current = snapshot.code;
      setRoom(snapshot);
      setCodeInput(snapshot.code);
      applySnapshotContent(snapshot);
      updateUrlRoomCode(snapshot.code);
      try {
        window.localStorage.setItem(LAST_ROOM_STORAGE, snapshot.code);
        setLastRoom(snapshot.code);
      } catch {
        // localStorage puede estar deshabilitado
      }

      unsubscribeRef.current = upcdeService.subscribe(snapshot.code, {
        onStatus: (nextStatus) => {
          setStatus(nextStatus);
          if (
            nextStatus === 'live' &&
            (pendingContentRef.current !== null ||
              pendingLanguageRef.current !== null)
          ) {
            void flushUpdateRef.current();
          }
        },
        onEvent: (event) => handleEventRef.current(event),
        onClosed: (reason) => {
          if (
            reason === 'room_deleted' ||
            reason === 'expired' ||
            reason === 'not_found'
          ) {
            toast.error(tRef.current.roomExpired);
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
            codeRef.current = null;
            setRoom(null);
            updateUrlRoomCode(null);
          }
        },
      });
    },
    [applySnapshotContent],
  );

  const joinRoom = useCallback(
    async (
      rawCode: string,
      options?: { signal?: AbortSignal; auto?: boolean },
    ) => {
      const code = rawCode.trim().toUpperCase();
      if (!code) {
        toast.error(tRef.current.invalidCode);
        return;
      }

      setJoining(true);
      try {
        const snapshot = await upcdeService.getRoom(code, options?.signal);
        if (options?.signal?.aborted) return;
        activateRoom(snapshot);
        if (!options?.auto) toast.success(tRef.current.joined);
      } catch (error: any) {
        if (options?.signal?.aborted) return;
        toast.error(error?.message || tRef.current.roomNotFound);
        if (options?.auto) updateUrlRoomCode(null);
      } finally {
        if (!options?.signal?.aborted) setJoining(false);
      }
    },
    [activateRoom],
  );

  const createRoom = useCallback(async () => {
    setCreating(true);
    try {
      const snapshot = await upcdeService.createRoom({
        language: 'html',
        clientId: clientIdRef.current,
        editorName: userNameRef.current,
      });
      activateRoom(snapshot);
      toast.success(tRef.current.created);
    } catch (error: any) {
      toast.error(error?.message || tRef.current.roomNotFound);
    } finally {
      setCreating(false);
    }
  }, [activateRoom]);

  const flushUpdate = useCallback(async () => {
    const code = codeRef.current;
    if (!code) return;

    const sentContent = pendingContentRef.current;
    const sentLanguage = pendingLanguageRef.current;

    const payload: { content?: string; language?: string } = {};
    if (sentContent !== null) payload.content = sentContent;
    if (sentLanguage !== null) payload.language = sentLanguage;
    if (sentContent === null && sentLanguage === null) return;

    try {
      const saved = await upcdeService.updateRoom(
        code,
        payload,
        clientIdRef.current,
        userNameRef.current,
      );
      if (codeRef.current === code) {
        versionRef.current = Math.max(versionRef.current, saved.version);
        setRoom((previous) =>
          previous && previous.code === code
            ? {
                ...previous,
                version: saved.version,
                updatedAt: saved.updatedAt,
                updatedBy: saved.updatedBy,
              }
            : previous,
        );
      }
      if (
        sentContent !== null &&
        pendingContentRef.current === sentContent
      ) {
        pendingContentRef.current = null;
      }
      if (
        sentLanguage !== null &&
        pendingLanguageRef.current === sentLanguage
      ) {
        pendingLanguageRef.current = null;
      }
    } catch (error: any) {
      // Los cambios pendientes se conservan para el próximo intento.
      toast.error(error?.message || tRef.current.saveError);
    }
  }, []);

  flushUpdateRef.current = flushUpdate;

  const scheduleUpdate = useCallback(() => {
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => {
      updateTimerRef.current = null;
      void flushUpdate();
    }, 350);
  }, [flushUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoading || !isAdmin) return;
    if (codeRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('sala');
    if (!code) return;

    const controller = new AbortController();
    void joinRoom(code, { signal: controller.signal, auto: true });
    return () => controller.abort();
  }, [isAdmin, isLoading, joinRoom]);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, []);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;

    if (next.length > UPCDE_MAX_CONTENT) {
      if (!tooLargeWarnedRef.current) {
        tooLargeWarnedRef.current = true;
        toast.error(t.tooLarge);
      }
      return;
    }

    tooLargeWarnedRef.current = false;
    setContent(next);
    contentRef.current = next;
    pendingContentRef.current = next;
    scheduleUpdate();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();

    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      contentRef.current.slice(0, start) + '  ' + contentRef.current.slice(end);

    if (next.length > UPCDE_MAX_CONTENT) return;

    setContent(next);
    contentRef.current = next;
    pendingContentRef.current = next;
    scheduleUpdate();

    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    pendingLanguageRef.current = value;
    scheduleUpdate();
  };

  const handleDrop = async (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;

    try {
      const text = await droppedFile.text();
      if (text.length > UPCDE_MAX_CONTENT) {
        toast.error(t.tooLarge);
        return;
      }
      setContent(text);
      contentRef.current = text;
      pendingContentRef.current = text;
      if (!room?.content) {
        const detected = languageFromFilename(droppedFile.name);
        setLanguage(detected);
        pendingLanguageRef.current = detected;
      }
      scheduleUpdate();
      toast.success(droppedFile.name);
    } catch {
      toast.error(t.saveError);
    }
  };

  const handleCopyLink = async () => {
    if (!room) return;
    try {
      await copyText(buildShareLink(room.code));
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t.copyError);
    }
  };

  const handleOpenWindow = () => {
    if (!room) return;
    window.open(buildShareLink(room.code), '_blank', 'noopener,noreferrer');
  };

  const handleLeave = () => {
    if (!window.confirm(t.confirmLeave)) return;

    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    pendingContentRef.current = null;
    pendingLanguageRef.current = null;
    codeRef.current = null;
    versionRef.current = 0;
    setRoom(null);
    setContent('');
    setStatus('offline');
    updateUrlRoomCode(null);
  };

  const handleCloseRoom = async () => {
    if (!room) return;
    if (!window.confirm(t.confirmClose)) return;

    try {
      await upcdeService.deleteRoom(room.code);
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      codeRef.current = null;
      pendingContentRef.current = null;
      pendingLanguageRef.current = null;
      versionRef.current = 0;
      setRoom(null);
      setContent('');
      setStatus('offline');
      updateUrlRoomCode(null);
      toast.success(t.closed);
    } catch (error: any) {
      toast.error(error?.message || t.closeError);
    }
  };

  const deferredContent = useDeferredValue(content);
  const tokens = useMemo(
    () => highlightCode(deferredContent, language),
    [deferredContent, language],
  );

  const formatUpdatedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === 'en'
              ? 'Access denied'
              : locale === 'zh'
                ? '拒绝访问'
                : 'Acceso denegado'}
          </h1>
          <p className="text-gray-600 mb-6">
            {locale === 'en'
              ? 'Only administrators can access this section.'
              : locale === 'zh'
                ? '只有管理员可以访问此部分。'
                : 'Solo los usuarios administradores pueden acceder a esta sección.'}
          </p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {locale === 'en'
              ? 'Back to home'
              : locale === 'zh'
                ? '返回首页'
                : 'Volver al inicio'}
          </a>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[status];
  const statusLabel =
    status === 'live'
      ? t.statusLive
      : status === 'connecting'
        ? t.statusConnecting
        : status === 'reconnecting'
          ? t.statusReconnecting
          : t.statusOffline;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {t.adminOnly}
            </span>
          </div>

          {room && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusStyle.pill}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700">
                <Users className="w-4 h-4 text-gray-500" />
                {t.viewers(room.viewers)}
              </span>
            </div>
          )}
        </div>

        {!room ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t.createTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex-1">
                {t.createDesc}
              </p>
              <button
                type="button"
                onClick={createRoom}
                disabled={creating}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Radio className="w-5 h-5" />
                )}
                {creating ? t.creating : t.createBtn}
              </button>

              {lastRoom && (
                <button
                  type="button"
                  onClick={() => joinRoom(lastRoom)}
                  className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  <Hash className="w-4 h-4" />
                  {t.lastRoom}: {lastRoom}
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t.joinTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex-1">{t.joinDesc}</p>

              <form
                className="mt-6 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void joinRoom(codeInput);
                }}
              >
                <input
                  value={codeInput}
                  onChange={(event) =>
                    setCodeInput(event.target.value.toUpperCase())
                  }
                  placeholder={t.codePlaceholder}
                  maxLength={12}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-center font-mono text-lg tracking-[0.35em] uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={joining || !codeInput.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {joining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MonitorPlay className="w-5 h-5" />
                  )}
                  {joining ? t.joining : t.joinBtn}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                    {t.roomLabel}
                  </p>
                  <p className="font-mono text-xl font-bold tracking-[0.3em] text-gray-900">
                    {room.code}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t.copied : t.copyLink}
                </button>

                <button
                  type="button"
                  onClick={handleOpenWindow}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.openWindow}
                </button>

                <button
                  type="button"
                  onClick={() => setWatchOnly((value) => !value)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {watchOnly ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <MonitorPlay className="w-4 h-4" />
                  )}
                  {watchOnly ? t.editMode : t.watchMode}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseRoom}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t.closeRoom}
                </button>
                <button
                  type="button"
                  onClick={handleLeave}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t.leave}
                </button>
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                watchOnly ? 'grid-cols-1' : 'lg:grid-cols-2'
              }`}
            >
              {!watchOnly && (
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        {t.editorTitle}
                      </h2>
                      <p className="text-xs text-gray-500">{t.editorHint}</p>
                    </div>
                    <select
                      aria-label={t.languageLabel}
                      value={language}
                      onChange={(event) =>
                        handleLanguageChange(event.target.value)
                      }
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {HIGHLIGHT_LANGUAGES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    spellCheck={false}
                    placeholder={`${t.editorHint}\n\n${t.dropHint}`}
                    className="w-full h-[60vh] resize-none p-4 font-mono text-sm leading-6 text-gray-900 bg-white focus:outline-none"
                  />

                  <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-gray-200 text-xs text-gray-500">
                    <span>{t.dropHint}</span>
                    <span className="font-mono">
                      {t.chars(content.length)}
                    </span>
                  </div>
                </section>
              )}

              <section className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h2 className="text-sm font-semibold text-slate-100">
                      {t.previewTitle}
                    </h2>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      {normalizeLanguage(language)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    {room.updatedBy ? (
                      <span>
                        {t.updatedBy(room.updatedBy.name)}
                        <span className="ml-1">
                          {t.updatedAt(formatUpdatedAt(room.updatedAt))}
                        </span>
                      </span>
                    ) : (
                      <span>{t.readOnly}</span>
                    )}
                  </div>
                </div>

                <pre className="w-full h-[60vh] overflow-auto p-4 font-mono text-sm leading-6 text-slate-100 whitespace-pre-wrap break-words">
                  <code>
                    {content ? (
                      tokens.map((token, index) =>
                        token.className ? (
                          <span key={index} className={token.className}>
                            {token.text}
                          </span>
                        ) : (
                          <span key={index}>{token.text}</span>
                        ),
                      )
                    ) : (
                      <span className="text-slate-500">
                        {t.previewEmpty}
                      </span>
                    )}
                  </code>
                </pre>

                <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>{statusLabel}</span>
                  <span className="font-mono">{t.chars(content.length)}</span>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
