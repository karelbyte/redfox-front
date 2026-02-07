"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';
import { accountsPayableService } from '@/services/accounts-payable.service';
import { providersService } from '@/services/providers.service';
import { toastService } from '@/services/toast.service';
import { Input, TextArea, Select, SearchSelect } from '@/components/atoms';

export interface AccountsPayableFormProps {
  account: AccountPayable | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface AccountsPayableFormRef {
  submit: () => void;
  reset: () => void;
}

interface FormData {
  referenceNumber: string;
  providerId: string;
  totalAmount: string;
  remainingAmount: string;
  issueDate: string;
  dueDate: string;
  status: AccountPayableStatus;
  notes: string;
}

interface FormErrors {
  referenceNumber?: string;
  providerId?: string;
  totalAmount?: string;
  remainingAmount?: string;
  issueDate?: string;
  dueDate?: string;
}

const AccountsPayableForm = forwardRef<AccountsPayableFormRef, AccountsPayableFormProps>(
  ({ account, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('accountsPayable');

    const [formData, setFormData] = useState<FormData>({
      referenceNumber: account?.referenceNumber || '',
      providerId: account?.providerId?.toString() || '',
      totalAmount: account?.totalAmount?.toString() || '',
      remainingAmount: account?.remainingAmount?.toString() || '',
      issueDate: account?.issueDate ? account.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: account?.dueDate ? account.dueDate.split('T')[0] : '',
      status: account?.status || AccountPayableStatus.PENDING,
      notes: account?.notes || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      if (account) {
        setFormData({
          referenceNumber: account.referenceNumber,
          providerId: account.providerId.toString(),
          totalAmount: account.totalAmount.toString(),
          remainingAmount: account.remainingAmount.toString(),
          issueDate: account.issueDate.split('T')[0],
          dueDate: account.dueDate.split('T')[0],
          status: account.status,
          notes: account.notes || '',
        });
      }
    }, [account]);

    useEffect(() => {
      const isValid = validateForm(true);
      onValidChange?.(isValid);
    }, [formData, onValidChange]);

    const validateForm = (silent: boolean = false): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.referenceNumber.trim()) {
        newErrors.referenceNumber = t('form.errors.referenceRequired');
        isValid = false;
      }

      if (!formData.providerId) {
        newErrors.providerId = t('form.errors.providerRequired');
        isValid = false;
      }

      if (!formData.totalAmount.trim()) {
        newErrors.totalAmount = t('form.errors.totalAmountRequired');
        isValid = false;
      } else if (isNaN(Number(formData.totalAmount)) || Number(formData.totalAmount) <= 0) {
        newErrors.totalAmount = t('form.errors.invalidAmount');
        isValid = false;
      }

      if (!formData.remainingAmount.trim()) {
        newErrors.remainingAmount = t('form.errors.remainingAmountRequired');
        isValid = false;
      } else if (isNaN(Number(formData.remainingAmount)) || Number(formData.remainingAmount) < 0) {
        newErrors.remainingAmount = t('form.errors.invalidAmount');
        isValid = false;
      } else if (Number(formData.remainingAmount) > Number(formData.totalAmount)) {
        newErrors.remainingAmount = t('form.errors.remainingGreaterThanTotal');
        isValid = false;
      }

      if (!formData.issueDate) {
        newErrors.issueDate = t('form.errors.issueDateRequired');
        isValid = false;
      }

      if (!formData.dueDate) {
        newErrors.dueDate = t('form.errors.dueDateRequired');
        isValid = false;
      }

      if (!silent) {
        setErrors(newErrors);
      }
      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        onSavingChange?.(true);
        const data = {
          referenceNumber: formData.referenceNumber.trim(),
          providerId: formData.providerId,
          totalAmount: Number(formData.totalAmount),
          remainingAmount: Number(formData.remainingAmount),
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        };

        if (account) {
          await accountsPayableService.updateAccountPayable(account.id, data);
          toastService.success(t('messages.accountUpdated'));
        } else {
          await accountsPayableService.createAccountPayable(data);
          toastService.success(t('messages.accountCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            account ? t('messages.errorUpdating') : t('messages.errorCreating')
          );
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    const handleReset = () => {
      setFormData({
        referenceNumber: '',
        providerId: '',
        totalAmount: '',
        remainingAmount: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: AccountPayableStatus.PENDING,
        notes: '',
      });
      setErrors({});
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      reset: handleReset,
    }));

    const handleSearchProviders = async (term: string) => {
      try {
        const response = await providersService.getProviders(1, term);
        return (response.data || []).map(provider => ({
          id: provider.id,
          label: `${provider.code} - ${provider.name}`,
          subtitle: provider.email || provider.phone || provider.description,
        }));
      } catch (error) {
        console.error('Error searching providers:', error);
        return [];
      }
    };

    const statusOptions = [
      { value: AccountPayableStatus.PENDING, label: t('status.pending') },
      { value: AccountPayableStatus.PARTIAL, label: t('status.partial') },
      { value: AccountPayableStatus.PAID, label: t('status.paid') },
      { value: AccountPayableStatus.OVERDUE, label: t('status.overdue') },
      { value: AccountPayableStatus.CANCELLED, label: t('status.cancelled') },
    ];

    return (
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              id="referenceNumber"
              label={t('form.referenceNumber')}
              required
              value={formData.referenceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder={t('form.placeholders.referenceNumber')}
              error={errors.referenceNumber}
            />
          </div>

          <div>
            <SearchSelect
              label={t('form.provider')}
              required
              value={formData.providerId}
              onChange={(value) => setFormData(prev => ({ ...prev, providerId: value }))}
              onSearch={handleSearchProviders}
              placeholder={t('form.placeholders.selectProvider')}
              error={errors.providerId}
            />
          </div>

          <div>
            <Input
              type="number"
              id="totalAmount"
              label={t('form.totalAmount')}
              required
              value={formData.totalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              error={errors.totalAmount}
            />
          </div>

          <div>
            <Input
              type="number"
              id="remainingAmount"
              label={t('form.remainingAmount')}
              required
              value={formData.remainingAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, remainingAmount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              error={errors.remainingAmount}
            />
          </div>

          <div>
            <Input
              type="date"
              id="issueDate"
              label={t('form.issueDate')}
              required
              value={formData.issueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
              error={errors.issueDate}
            />
          </div>

          <div>
            <Input
              type="date"
              id="dueDate"
              label={t('form.dueDate')}
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              error={errors.dueDate}
            />
          </div>

          <div>
            <Select
              id="status"
              label={t('form.status')}
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AccountPayableStatus }))}
              options={statusOptions}
            />
          </div>

          <div className="md:col-span-2">
            <TextArea
              id="notes"
              label={t('form.notes')}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder={t('form.placeholders.notes')}
            />
          </div>
        </div>
      </form>
    );
  }
);

AccountsPayableForm.displayName = "AccountsPayableForm";

export default AccountsPayableForm;
