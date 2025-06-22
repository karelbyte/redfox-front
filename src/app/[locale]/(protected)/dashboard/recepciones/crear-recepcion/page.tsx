'use client'

import { useTranslations } from 'next-intl';

export default function CreateReceptionPage() {
  const t = useTranslations('pages.receptions');
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
          {t('newReception')}
        </h1>
      </div>

      <div className="mt-6">
        {/* Aquí irá el formulario de recepción */}
        <p className="text-gray-500">Formulario de recepción en desarrollo...</p>
      </div>
    </div>
  );
} 