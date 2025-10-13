import { useTranslations } from 'next-intl';
import { InvoiceFormData, Client, PaymentMethod } from '@/types/invoice';
import { Input } from '@/components/atoms';
import { SelectWithAdd } from '@/components/atoms';
import { useState, useEffect } from 'react';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  clients: Client[];
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function InvoiceForm({ initialData, clients, onSubmit, onCancel, isLoading }: InvoiceFormProps) {
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

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label={t('form.code')}
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder={t('form.codePlaceholder')}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Input
            label={t('form.date')}
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          label={t('form.paymentConditions')}
          value={formData.payment_conditions || ''}
          onChange={(e) => handleInputChange('payment_conditions', e.target.value)}
          placeholder={t('form.paymentConditionsPlaceholder')}
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('form.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          style={{ backgroundColor: `rgb(var(--color-primary-600))` }}
          disabled={isLoading}
        >
          {isLoading ? t('form.saving') : t('form.save')}
        </button>
      </div>
    </form>
  );
}
