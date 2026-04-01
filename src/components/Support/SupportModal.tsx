'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { supportService } from '@/services/support.service';
import Loading from '@/components/Loading/Loading';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECTS = {
  es: [
    'Tengo un problema técnico',
    'No entiendo cómo funciona algo',
    'Encontré un error',
    'Quiero sugerir una mejora',
    'Otro',
  ],
  en: [
    'I have a technical issue',
    "I don't understand how something works",
    'I found a bug',
    'I want to suggest an improvement',
    'Other',
  ],
};

const COPY = {
  es: {
    title: 'Contactar Soporte',
    description: 'Cuéntanos en qué podemos ayudarte. Te responderemos a la brevedad.',
    subjectLabel: 'Asunto',
    subjectPlaceholder: 'Selecciona un asunto...',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Describe tu consulta con el mayor detalle posible...',
    send: 'Enviar mensaje',
    sending: 'Enviando...',
    cancel: 'Cancelar',
    successTitle: '¡Mensaje enviado!',
    successDesc: 'Recibimos tu mensaje. Te responderemos pronto.',
    close: 'Cerrar',
    errorMsg: 'No se pudo enviar el mensaje. Intenta de nuevo.',
    minLength: 'El mensaje debe tener al menos 10 caracteres.',
    selectSubject: 'Selecciona un asunto.',
  },
  en: {
    title: 'Contact Support',
    description: "Tell us how we can help you. We'll get back to you shortly.",
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Select a subject...',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your question in as much detail as possible...',
    send: 'Send message',
    sending: 'Sending...',
    cancel: 'Cancel',
    successTitle: 'Message sent!',
    successDesc: 'We received your message. We will reply soon.',
    close: 'Close',
    errorMsg: 'Could not send the message. Please try again.',
    minLength: 'Message must be at least 10 characters.',
    selectSubject: 'Please select a subject.',
  },
};

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'es';
  const c = COPY[lang];
  const subjects = SUBJECTS[lang];

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setSent(false);
    setError('');
    onClose();
  };

  const handleSend = async () => {
    setError('');
    if (!subject) { setError(c.selectSubject); return; }
    if (message.trim().length < 10) { setError(c.minLength); return; }

    try {
      setSending(true);
      await supportService.sendMessage(subject, message.trim());
      setSent(true);
    } catch {
      setError(c.errorMsg);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: `rgb(var(--color-primary-100))` }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {c.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {sent ? (
            <div className="text-center py-6">
              <h3 className="text-base font-semibold text-gray-800 mb-1">{c.successTitle}</h3>
              <p className="text-sm text-gray-500">{c.successDesc}</p>
              <button
                onClick={handleClose}
                className="mt-5 px-5 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
              >
                {c.close}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Asunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{c.subjectLabel}</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `rgb(var(--color-primary-400))` } as React.CSSProperties}
                >
                  <option value="">{c.subjectPlaceholder}</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{c.messageLabel}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={c.messagePlaceholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `rgb(var(--color-primary-400))` } as React.CSSProperties}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{message.length} / 1000</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {c.cancel}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
            >
              {sending ? <Loading size="sm" /> : <PaperAirplaneIcon className="h-4 w-4" />}
              {sending ? c.sending : c.send}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
