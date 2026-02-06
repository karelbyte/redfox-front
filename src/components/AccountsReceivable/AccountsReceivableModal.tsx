"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountReceivable, AccountReceivableStatus } from '@/types/account-receivable';
import { Client } from '@/types/client';
import { accountsReceivableService } from '@/services/accounts-receivable.service';
import { toastService } from '@/services/toast.service';
import { Btn, Input, TextArea, Select } from '@/components/atoms';

interface AccountsReceivableModalProps {
  account?: AccountReceivable | null;
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  referenceNumber: string;
  clientId: string;
  totalAmount: string;
  remainingAmount: string;
  dueDate: string;
  status: AccountReceivableStatus;
  description: string;
  notes: string;
}

interface FormErrors {
  referenceNumber?: string;
  clientId?: string;
  totalAmount?: string;
  remainingAmount?: string;
  dueDate?: string;
}

export default function AccountsReceivableModal({ account, clients, onClose, onSuccess }: AccountsReceivableModalProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<FormData>({
    referenceNumber: account?.referenceNumber || '',
    clientId: account?.clientId?.toString() || '',
    totalAmount: account?.totalAmount?.toString() || '',
    remainingAmount: account?.remainingAmount?.toString() || '',
    dueDate: account?.dueDate ? account.dueDate.split('T')[0] : '',
    status: account?.status || AccountReceivableStatus.PENDING,
    description: account?.description || '',
    notes: account?.notes || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        referenceNumber: account.referenceNumber,
        clientId: account.clientId.toString(),
        totalAmount: account.totalAmount.toString(),
        remainingAmount: account.remainingAmount.toString(),
        dueDate: account.dueDate.split('T')[0],
        status: account.status,
        description: account.description || '',
        notes: account.notes || '',
      });
    }
  }, [account]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = t('form.errors.referenceRequired');
      isValid = false;
    }

    if (!formData.clientId) {
      newErrors.clientId = t('form.errors.clientRequired');
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

    if (!formData.dueDate) {
      newErrors.dueDate = t('form.errors.dueDateRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const data = {
        referenceNumber: formData.referenceNumber.trim(),
        clientId: Number(formData.clientId),
        totalAmount: Number(formData.totalAmount),
        remainingAmount: Number(formData.remainingAmount),
        dueDate: formData.dueDate,
        status: formData.status,
        description: formData.description.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (account) {
        await accountsReceivableService.updateAccountReceivable(account.id, data);
        toastService.success(t('messages.accountUpdated'));
      } else {
        await accountsReceivableService.createAccountReceivable(data);
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
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: AccountReceivableStatus.PENDING, label: t('status.pending') },
    { value: AccountReceivableStatus.PARTIAL, label: t('status.partial') },
    { value: AccountReceivableStatus.PAID, label: t('status.paid') },
    { value: AccountReceivableStatus.OVERDUE, label: t('status.overdue') },
    { value: AccountReceivableStatus.CANCELLED, label: t('status.cancelled') },
  ];

  const clientOptions = clients.map(client => ({
    value: client.id.toString(),
    label: client.name,
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">{tCommon('actions.close')}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                {account ? t('editAccount') : t('addAccount')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Select
                      id="clientId"
                      label={t('form.client')}
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                      options={clientOptions}
                      placeholder={t('form.placeholders.selectClient')}
                      error={errors.clientId}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AccountReceivableStatus }))}
                      options={statusOptions}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      id="description"
                      label={t('form.description')}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('form.placeholders.description')}
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

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Btn
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="inline-flex w-full justify-center text-sm shadow-sm sm:ml-3 sm:w-auto"
                  >
                    {isLoading ? tCommon('actions.saving') : (account ? tCommon('actions.update') : tCommon('actions.create'))}
                  </Btn>
                  <Btn
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="mt-3 inline-flex w-full justify-center text-sm sm:mt-0 sm:w-auto"
                  >
                    {tCommon('actions.cancel')}
                  </Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}