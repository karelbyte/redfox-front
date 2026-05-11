'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@headlessui/react';
import { Input, TextArea, Btn } from '@/components/atoms';
import { toastService } from '@/services/toast.service';
import { quotationService } from '@/services/quotations.service';

interface SendQuotationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  defaultEmail?: string;
  locale?: string;
}

export default function SendQuotationEmailModal({
  isOpen,
  onClose,
  quotationId,
  defaultEmail,
  locale
}: SendQuotationEmailModalProps) {
  const t = useTranslations('pages.quotations');
  const tCommon = useTranslations('common');
  const [emails, setEmails] = useState(defaultEmail || '');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!emails.trim()) {
       toastService.error(t('messages.emailRequired', { default: 'El correo electrónico es requerido' }));
       return;
    }

    // Parse emails separated by comma or semicolon
    const emailList = emails.split(/[,;]/).map(e => e.trim()).filter(e => e.length > 0);
    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !validEmailRegex.test(e));

    if (invalidEmails.length > 0) {
      toastService.error(t('messages.invalidEmails', { default: `Correos inválidos: ${invalidEmails.join(', ')}` }));
      return;
    }

    try {
      setIsSending(true);
      const res = await quotationService.sendEmail(quotationId, emailList, message, locale);
      if (res.sent) {
        if (res.message === 'email_processing_queued') {
          toastService.info(t('messages.emailQueued'));
        } else {
          toastService.success(tCommon('messages.success'));
        }
        onClose();
      } else {
        toastService.error(res.message || tCommon('messages.error', { default: 'Ha ocurrido un error' }));
      }
    } catch (error) {
       toastService.error(error instanceof Error ? error.message : tCommon('messages.error', { default: 'Ha ocurrido un error' }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !isSending && onClose()} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6 shadow-xl border border-gray-100">
          <Dialog.Title className="text-xl font-bold leading-6 mb-4" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('actions.sendByEmail', { default: 'Enviar por correo' })}
          </Dialog.Title>

          <div className="space-y-4">
            <Input
              id="emails"
              label={t('form.email', { default: 'Correos (separados por coma)' })}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="cliente@ejemplo.com, copias@ejemplo.com"
              disabled={isSending}
              required
            />
            <TextArea
              id="message"
              label={t('form.emailMessage', { default: 'Mensaje personalizado (opcional)' })}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('form.placeholders.emailMessage', { default: 'Escribe un mensaje para adjuntar al correo...' })}
              rows={4}
              disabled={isSending}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Btn
              variant="outline"
              onClick={onClose}
              disabled={isSending}
            >
              {tCommon('actions.cancel')}
            </Btn>
            <Btn
              variant="primary"
              onClick={handleSend}
              loading={isSending}
              disabled={!emails.trim()}
            >
              {t('actions.send', { default: 'Enviar' })}
            </Btn>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
