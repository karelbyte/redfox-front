import { useTranslations } from 'next-intl';
import { InvoiceFormData, Client, PaymentMethod } from '@/types/invoice';
import { Input } from '@/components/atoms';
import { SelectWithAdd } from '@/components/atoms';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface InvoiceFormRef {
  submit: () => void;
  reset: () => void;
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  clients: Client[];
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

const InvoiceForm = forwardRef<InvoiceFormRef, InvoiceFormProps>(
  ({ initialData, clients, onSuccess, onSavingChange, onValidChange }, ref) => {
  const t = useTranslations('pages.invoices');
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    code: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    payment_method: PaymentMethod.CASH,
    payment_conditions: '',
    notes: '',
    details: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = t('form.errors.codeRequired');
    }

    if (!formData.date) {
      newErrors.date = t('form.errors.dateRequired');
    }

    if (!formData.client_id) {
      newErrors.client_id = t('form.errors.clientRequired');
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (onValidChange) {
      onValidChange(isValid);
    }

    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  // Implementar el ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleReset
  }));

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      if (onSavingChange) {
        onSavingChange(true);
      }

      // Importar el servicio dinámicamente para evitar problemas de importación circular
      const { invoiceService } = await import('@/services');
      await invoiceService.createInvoice(formData);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating invoice:', error);
      // Importar toastService dinámicamente
      const { toastService } = await import('@/services/toast.service');
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error('Error al crear la factura');
      }
    } finally {
      setIsSaving(false);
      if (onSavingChange) {
        onSavingChange(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      code: '',
      date: new Date().toISOString().split('T')[0],
      client_id: '',
      payment_method: PaymentMethod.CASH,
      payment_conditions: '',
      notes: '',
      details: []
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const paymentMethodOptions = [
    { value: PaymentMethod.CASH, label: t('form.paymentMethods.cash') },
    { value: PaymentMethod.CARD, label: t('form.paymentMethods.card') },
    { value: PaymentMethod.TRANSFER, label: t('form.paymentMethods.transfer') },
    { value: PaymentMethod.CHECK, label: t('form.paymentMethods.check') }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label={t('form.code')}
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder={t('form.codePlaceholder')}
            required
            disabled={isSaving}
            error={errors.code}
          />
        </div>
        
        <div>
          <Input
            label={t('form.date')}
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            disabled={isSaving}
            error={errors.date}
          />
        </div>
      </div>

      <div>
        <SelectWithAdd
          label={t('form.client')}
          value={formData.client_id}
          onChange={(value) => handleInputChange('client_id', value)}
          options={clients.map(client => ({
            value: client.id,
            label: `${client.name} (${client.code})`
          }))}
          placeholder={t('form.clientPlaceholder')}
          required
          disabled={isSaving}
          error={errors.client_id}
        />
      </div>

      <div>
        <SelectWithAdd
          label={t('form.paymentMethod')}
          value={formData.payment_method}
          onChange={(value) => handleInputChange('payment_method', value)}
          options={paymentMethodOptions}
          placeholder={t('form.paymentMethodPlaceholder')}
          required
          disabled={isSaving}
        />
      </div>

      <div>
        <Input
          label={t('form.paymentConditions')}
          value={formData.payment_conditions || ''}
          onChange={(e) => handleInputChange('payment_conditions', e.target.value)}
          placeholder={t('form.paymentConditionsPlaceholder')}
          disabled={isSaving}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.notes')}
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder={t('form.notesPlaceholder')}
          disabled={isSaving}
        />
      </div>
    </div>
  );
});

export default InvoiceForm;
