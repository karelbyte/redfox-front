"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Expense, ExpenseCategory, ExpenseStatus } from '@/types/expense';
import { Provider } from '@/types/provider';
import { expensesService } from '@/services/expenses.service';
import { providersService } from '@/services/providers.service';
import { toastService } from '@/services/toast.service';
import { Input, TextArea, Select, SearchSelect } from '@/components/atoms';
import TagSelector from '@/components/atoms/TagSelector';
import TemplateSelector from '@/components/atoms/TemplateSelector';
import { Tag } from '@/services/tags.service';

export interface ExpenseFormProps {
  expense: Expense | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange?: (isSaving: boolean) => void;
  onValidChange?: (isValid: boolean) => void;
}

export interface ExpenseFormRef {
  submit: () => void;
  reset: () => void;
}

interface FormData {
  description: string;
  amount: string;
  categoryId: string;
  providerId: string;
  reference: string;
  expenseDate: string;
  status: ExpenseStatus;
  notes: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  categoryId?: string;
  expenseDate?: string;
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(
  ({ expense, categories, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('expenses');
    const locale = useLocale();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [localCategories, setLocalCategories] = useState<ExpenseCategory[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    const [formData, setFormData] = useState<FormData>({
      description: expense?.description || '',
      amount: expense?.amount?.toString() || '',
      categoryId: expense?.categoryId?.toString() || '',
      providerId: expense?.providerId?.toString() || '',
      reference: expense?.reference || '',
      expenseDate: expense?.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
      status: expense?.status || ExpenseStatus.PENDING,
      notes: expense?.notes || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
      loadProviders();
    }, []);

    useEffect(() => {
      if (categories && categories.length > 0) {
        setLocalCategories(categories);
      }
    }, [categories]);

    useEffect(() => {
      if (expense) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          categoryId: expense.categoryId.toString(),
          providerId: expense.providerId?.toString() || '',
          reference: expense.reference || '',
          expenseDate: expense.expenseDate.split('T')[0],
          status: expense.status,
          notes: expense.notes || '',
        });
      }
    }, [expense]);

    useEffect(() => {
      const isValid = validateForm(true);
      onValidChange?.(isValid);
    }, [formData, onValidChange]);

    const loadProviders = async () => {
      try {
        const response = await providersService.getProviders(1, '');
        console.log('Providers loaded:', response);
        setProviders(response.data || []);
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    };

    const categoryTranslations = useMemo(() => ({
      'Office Supplies': { es: 'Suministros de Oficina', en: 'Office Supplies' },
      'Utilities': { es: 'Servicios', en: 'Utilities' },
      'Rent': { es: 'Alquiler', en: 'Rent' },
      'Marketing': { es: 'Marketing', en: 'Marketing' },
      'Travel': { es: 'Viajes', en: 'Travel' },
      'Professional Services': { es: 'Servicios Profesionales', en: 'Professional Services' },
      'Equipment': { es: 'Equipos', en: 'Equipment' },
      'Insurance': { es: 'Seguros', en: 'Insurance' },
      'Maintenance': { es: 'Mantenimiento', en: 'Maintenance' },
      'Other': { es: 'Otros', en: 'Other' },
    }), []);

    const getCategoryLabel = (category: ExpenseCategory): string => {
      const translation = categoryTranslations[category.name as keyof typeof categoryTranslations];
      return translation ? translation[locale as 'es' | 'en'] : category.name;
    };

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

    const validateForm = (silent: boolean = false): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      if (!formData.description.trim()) {
        newErrors.description = t('form.errors.descriptionRequired');
        isValid = false;
      }

      if (!formData.amount.trim()) {
        newErrors.amount = t('form.errors.amountRequired');
        isValid = false;
      } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        newErrors.amount = t('form.errors.invalidAmount');
        isValid = false;
      }

      if (!formData.categoryId) {
        newErrors.categoryId = t('form.errors.categoryRequired');
        isValid = false;
      }

      if (!formData.expenseDate) {
        newErrors.expenseDate = t('form.errors.dateRequired');
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
          description: formData.description.trim(),
          amount: Number(formData.amount),
          categoryId: Number(formData.categoryId),
          providerId: formData.providerId || undefined,
          reference: formData.reference.trim() || undefined,
          expenseDate: formData.expenseDate,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        };

        if (expense) {
          await expensesService.updateExpense(expense.id, data);
          toastService.success(t('messages.expenseUpdated'));
        } else {
          await expensesService.createExpense(data);
          toastService.success(t('messages.expenseCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(
            expense ? t('messages.errorUpdating') : t('messages.errorCreating')
          );
        }
      } finally {
        onSavingChange?.(false);
      }
    };

    const handleReset = () => {
      setFormData({
        description: '',
        amount: '',
        categoryId: '',
        providerId: '',
        reference: '',
        expenseDate: new Date().toISOString().split('T')[0],
        status: ExpenseStatus.PENDING,
        notes: '',
      });
      setErrors({});
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      reset: handleReset,
    }));

    const statusOptions = [
      { value: ExpenseStatus.PENDING, label: t('status.pending') },
      { value: ExpenseStatus.APPROVED, label: t('status.approved') },
      { value: ExpenseStatus.REJECTED, label: t('status.rejected') },
      { value: ExpenseStatus.PAID, label: t('status.paid') },
    ];

    const categoryOptions = useMemo(() =>
      localCategories?.map(category => ({
        value: category.id.toString(),
        label: getCategoryLabel(category),
      })) || [],
      [localCategories, locale]
    );

    const providerOptions = providers?.map(provider => ({
      value: provider.id.toString(),
      label: `${provider.code} - ${provider.name}`,
    })) || [];

    return (
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              id="description"
              label={t('form.description')}
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('form.placeholders.description')}
              error={errors.description}
            />
          </div>

          <div>
            <Input
              type="number"
              id="amount"
              label={t('form.amount')}
              required
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              error={errors.amount}
            />
          </div>

          <div>
            <Select
              id="categoryId"
              label={t('form.category')}
              required
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              options={categoryOptions}
              placeholder={t('form.placeholders.selectCategory')}
              error={errors.categoryId}
            />
          </div>

          <div>
            <SearchSelect
              label={t('form.provider')}
              value={formData.providerId}
              onChange={(value) => setFormData(prev => ({ ...prev, providerId: value }))}
              onSearch={handleSearchProviders}
              placeholder={t('form.placeholders.selectProvider')}
            />
          </div>

          <div>
            <Input
              type="text"
              id="reference"
              label={t('form.reference')}
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder={t('form.placeholders.reference')}
            />
          </div>

          <div>
            <Input
              type="date"
              id="expenseDate"
              label={t('form.expenseDate')}
              required
              value={formData.expenseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
              error={errors.expenseDate}
            />
          </div>

          <div>
            <Select
              id="status"
              label={t('form.status')}
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ExpenseStatus }))}
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

          {expense && (
            <>
              <div className="md:col-span-2">
                <TagSelector
                  entityType="expense"
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>

              <div className="md:col-span-2">
                <TemplateSelector
                  entityType="expense"
                  onSelectTemplate={(template) => {
                    setFormData(prev => ({
                      ...prev,
                      ...template.data,
                    }));
                  }}
                  onSaveAsTemplate={(name, data) => {
                    // Template data will be saved with current form data
                  }}
                />
              </div>
            </>
          )}
        </div>
      </form>
    );
  }
);

ExpenseForm.displayName = "ExpenseForm";

export default ExpenseForm;
