'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { CashRegister } from '@/types/cash-register';
import { Input, TextArea } from '@/components/atoms';

interface CashRegisterFormData {
  name: string;
  description: string;
  initial_amount: number;
}

interface CashRegisterFormErrors {
  name?: string;
  description?: string;
  initial_amount?: string;
}

export interface CashRegisterFormProps {
  cashRegister: CashRegister | null;
  onValidityChange: (isValid: boolean) => void;
}

export interface CashRegisterFormRef {
  getFormData: () => CashRegisterFormData;
}

const CashRegisterForm = forwardRef<CashRegisterFormRef, CashRegisterFormProps>(
  ({ cashRegister, onValidityChange }, ref) => {
    const t = useTranslations('pages.cashRegisters');
    const [formData, setFormData] = useState<CashRegisterFormData>({
      name: cashRegister?.name || '',
      description: cashRegister?.description || '',
      initial_amount: cashRegister?.initial_amount || 0,
    });
    const [errors, setErrors] = useState<CashRegisterFormErrors>({});

    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
    }));

    useEffect(() => {
      if (cashRegister) {
        setFormData({
          name: cashRegister.name,
          description: cashRegister.description || '',
          initial_amount: cashRegister.initial_amount,
        });
      }
    }, [cashRegister]);

    useEffect(() => {
      const isValid = formData.name.trim() !== '' && formData.initial_amount >= 0;
      onValidityChange(isValid);
    }, [formData, onValidityChange]);

    const handleChange = (field: keyof CashRegisterFormData, value: string | number) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const handleBlur = (field: keyof CashRegisterFormData) => {
      if (field === 'name' && !formData.name.trim()) {
        setErrors(prev => ({ ...prev, name: t('validation.nameRequired') }));
      }
      if (field === 'initial_amount' && formData.initial_amount < 0) {
        setErrors(prev => ({ ...prev, initial_amount: t('validation.invalidAmount') }));
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.name')} *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder={t('form.namePlaceholder')}
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.description')}
          </label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.initialAmount')} *
          </label>
          <Input
            type="number"
            value={formData.initial_amount}
            onChange={(e) => handleChange('initial_amount', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('initial_amount')}
            placeholder="0.00"
            min={0}
            step={0.01}
            error={errors.initial_amount}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('form.initialAmountHelp')}
          </p>
        </div>
      </div>
    );
  }
);

CashRegisterForm.displayName = 'CashRegisterForm';

export default CashRegisterForm;
