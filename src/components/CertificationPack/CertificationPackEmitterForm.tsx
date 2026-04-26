'use client'

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CertificationPackEmitter } from '@/types/certification-pack';
import { certificationPackService } from '@/services/certification-packs.service';
import { toastService } from '@/services/toast.service';

export interface CertificationPackEmitterFormRef {
  submit: () => void;
}

interface CertificationPackEmitterFormProps {
  packId: string;
  emitter?: CertificationPackEmitter | null;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onClose: () => void;
}

function CertificationPackEmitterFormInner(
  {
    packId,
    emitter,
    onSuccess,
    onSavingChange,
    onClose,
  }: CertificationPackEmitterFormProps,
  ref: React.ForwardedRef<CertificationPackEmitterFormRef>,
) {
  const t = useTranslations('pages.certificationPacks');
  const [formData, setFormData] = useState<Omit<CertificationPackEmitter, 'id'>>({
    emitter: '',
    name: '',
    fav: false,
    status: 'active',
  });

  useEffect(() => {
    if (emitter) {
      setFormData({
        emitter: emitter.emitter,
        name: emitter.name,
        fav: emitter.fav || false,
        status: emitter.status || 'active',
      });
    } else {
      setFormData({
        emitter: '',
        name: '',
        fav: false,
        status: 'active',
      });
    }
  }, [emitter]);

  const handleSubmit = async () => {
    if (!formData.emitter.trim() || !formData.name.trim()) {
      toastService.error(t('emitters.messages.requiredFields'));
      return;
    }

    try {
      onSavingChange(true);

      if (emitter) {
        await certificationPackService.updateEmitter(packId, emitter.id!, formData);
        toastService.success(t('emitters.messages.updated'));
      } else {
        await certificationPackService.addEmitter(packId, formData);
        toastService.success(t('emitters.messages.created'));
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving emitter:', error);
      toastService.error(t('emitters.messages.errorSaving'));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Identificador del emisor *
        </label>
        <input
          type="text"
          value={formData.emitter}
          onChange={(e) => setFormData(prev => ({ ...prev, emitter: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Identificador del emisor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Emisor *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre del emisor"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.fav}
            onChange={(e) => setFormData(prev => ({ ...prev, fav: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Favorito / Por defecto</span>
        </label>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.status === 'active'}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Activo</span>
        </label>
      </div>
    </form>
  );
}

const CertificationPackEmitterForm = forwardRef<CertificationPackEmitterFormRef, CertificationPackEmitterFormProps>(
  CertificationPackEmitterFormInner,
);

CertificationPackEmitterForm.displayName = 'CertificationPackEmitterForm';

export default CertificationPackEmitterForm;
