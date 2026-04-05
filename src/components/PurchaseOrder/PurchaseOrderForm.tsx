'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { PurchaseOrder, PurchaseOrderFormData } from '@/types/purchase-order';
import { providersService } from '@/services';
import { toastService } from '@/services';
import { Input, SearchSelect, TextArea } from '@/components/atoms';
import { SurrogateInput } from '@/components/atoms/SurrogateInput';

export interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface PurchaseOrderFormRef {
  submit: () => Promise<PurchaseOrderFormData | null>;
  getFormData: () => PurchaseOrderFormData;
}

interface FormErrors {
  code?: string;
  date?: string;
  provider_id?: string;
  expected_delivery_date?: string;
}

const PurchaseOrderForm = forwardRef<PurchaseOrderFormRef, PurchaseOrderFormProps>(
  ({ purchaseOrder, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.purchaseOrders');
    const [formData, setFormData] = useState<PurchaseOrderFormData>({
      code: '',
      date: new Date().toISOString().split('T')[0],
      provider_id: '',
      warehouse_id: '',
      document: '',
      amount: 0,
      notes: '',
      expected_delivery_date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (purchaseOrder) {
        setFormData({
          code: purchaseOrder.code,
          date: purchaseOrder.date,
          provider_id: purchaseOrder.provider.id,
          warehouse_id: purchaseOrder.warehouse?.id || '',
          document: purchaseOrder.document || '',
          amount: purchaseOrder.amount,
          notes: purchaseOrder.notes || '',
          expected_delivery_date: purchaseOrder.expected_delivery_date,
          status: purchaseOrder.status,
        });
      }
    }, [purchaseOrder]);

    const searchProviders = async (term: string): Promise<{ id: string; label: string; subtitle?: string }[]> => {
      try {
        const response = await providersService.getProviders();
        const providers = response.data || [];
        if (!term.trim()) {
          return providers.map(p => ({ id: p.id, label: p.name, subtitle: `Código: ${p.code}` }));
        }
        return providers
          .filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.code.toLowerCase().includes(term.toLowerCase()))
          .map(p => ({ id: p.id, label: p.name, subtitle: `Código: ${p.code}` }));
      } catch {
        return [];
      }
    };

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
      if (!formData.code.trim()) newErrors.code = t('form.errors.codeRequired');
      if (!formData.date) newErrors.date = t('form.errors.dateRequired');
      if (!formData.provider_id) newErrors.provider_id = t('form.errors.providerRequired');
      if (!formData.expected_delivery_date) newErrors.expected_delivery_date = t('form.errors.expectedDeliveryDateRequired');
      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange?.(isValid);
      return isValid;
    };

    useEffect(() => {
      const id = setTimeout(() => validateForm(), 300);
      return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleSubmit = async (): Promise<PurchaseOrderFormData | null> => {
      if (!validateForm()) return null;
      try {
        onSavingChange?.(true);
        return {
          ...formData,
          code: formData.code.trim(),
          document: formData.document?.trim() || '',
          notes: formData.notes?.trim() || '',
          amount: 0,
        };
      } catch (error) {
        toastService.error(error instanceof Error ? error.message : t('messages.errorCreating'));
        return null;
      } finally {
        onSavingChange?.(false);
      }
    };

    useImperativeHandle(ref, () => ({ submit: handleSubmit, getFormData: () => formData }));

    return (
      <form className="space-y-6">
        <SurrogateInput
          label={t('form.code')}
          placeholder={t('form.placeholders.code')}
          value={formData.code}
          onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
          surrogateCode="purchase_order"
          error={errors.code}
          required
        />

        <Input
          type="date"
          label={t('form.date')}
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          error={errors.date}
          required
        />

        <SearchSelect
          value={formData.provider_id}
          onChange={(id) => setFormData(prev => ({ ...prev, provider_id: id }))}
          onSearch={searchProviders}
          label={t('form.provider')}
          placeholder={t('form.placeholders.provider')}
          required
          error={errors.provider_id}
        />

        <Input
          type="date"
          label={t('form.expectedDeliveryDate')}
          value={formData.expected_delivery_date}
          onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
          error={errors.expected_delivery_date}
          required
        />

        {/* Documento — referencia del proveedor, opcional */}
        <Input
          label={`${t('form.document')} (${t('form.optional')})`}
          placeholder={t('form.placeholders.document')}
          value={formData.document || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
          helperText={t('form.documentHint')}
        />

        <TextArea
          label={t('form.notes')}
          placeholder={t('form.placeholders.notes')}
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </form>
    );
  }
);

PurchaseOrderForm.displayName = 'PurchaseOrderForm';
export default PurchaseOrderForm;
