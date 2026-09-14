'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { documentSeriesService } from '@/services/document-series.service';
import { toastService } from '@/services/toast.service';
import { DocumentSeriesFormData, DocumentType } from '@/types/document-series';

export interface DocumentSeriesFormRef {
  submit: () => void;
}

interface DocumentSeriesFormProps {
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

function DocumentSeriesFormInner(
  { onSuccess, onSavingChange, onValidChange }: DocumentSeriesFormProps,
  ref: React.ForwardedRef<DocumentSeriesFormRef>,
) {
  const t = useTranslations('pages.documentSeries');
  const [formData, setFormData] = useState<DocumentSeriesFormData>({
    document_type: DocumentType.FACTURA,
    series: '',
    is_default: true,
  });

  // SUNAT identifica la serie con una letra y tres dígitos: F001, B001...
  const isValid = useMemo(
    () => /^[A-Z][A-Z0-9]{0,3}$/.test(formData.series.trim()),
    [formData.series],
  );

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      onSavingChange(true);
      await documentSeriesService.create({
        ...formData,
        series: formData.series.trim().toUpperCase(),
      });
      toastService.success(t('messages.successCreated'));
      onSuccess();
    } catch (error) {
      console.error('Error saving document series:', error);
      toastService.error(t('messages.errorSaving'));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.documentType')} *
        </label>
        <select
          value={formData.document_type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              document_type: e.target.value as DocumentType,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DocumentType).map((type) => (
            <option key={type} value={type}>
              {t(`documentTypes.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.series')} *
        </label>
        <input
          type="text"
          maxLength={4}
          value={formData.series}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, series: e.target.value.toUpperCase() }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder={formData.document_type === DocumentType.BOLETA ? 'B001' : 'F001'}
        />
        <p className="mt-1 text-xs text-gray-500">{t('form.seriesHint')}</p>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={!!formData.is_default}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_default: e.target.checked }))
          }
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2 text-sm text-gray-700">{t('form.isDefault')}</span>
      </label>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <p className="text-xs text-amber-800">{t('form.correlativeWarning')}</p>
      </div>
    </form>
  );
}

const DocumentSeriesForm = forwardRef<DocumentSeriesFormRef, DocumentSeriesFormProps>(
  DocumentSeriesFormInner,
);

DocumentSeriesForm.displayName = 'DocumentSeriesForm';

export default DocumentSeriesForm;
