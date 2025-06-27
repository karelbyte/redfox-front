'use client';

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Checkbox } from '@/components/atoms';
import { Role, RoleFormData } from '@/types/role';
import { rolesService } from '@/services/roles.service';
import { toastService } from '@/services/toast.service';

export interface RoleFormRef {
  submit: () => void;
}

interface RoleFormProps {
  role: Role | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (saving: boolean) => void;
  onValidChange: (valid: boolean) => void;
}

const RoleForm = forwardRef<RoleFormRef, RoleFormProps>(
  ({ role, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.roles');
    const [formData, setFormData] = useState<RoleFormData>({
      code: '',
      description: '',
      status: true
    });
    const [errors, setErrors] = useState<Partial<RoleFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (role) {
        setFormData({
          code: role.code,
          description: role.description,
          status: role.status
        });
      }
    }, [role]);

    useEffect(() => {
      onSavingChange(isSubmitting);
    }, [isSubmitting, onSavingChange]);

    const validateForm = (): boolean => {
      const newErrors: Partial<RoleFormData> = {};

      if (!formData.code.trim()) {
        newErrors.code = t('form.validation.codeRequired');
      }

      if (!formData.description.trim()) {
        newErrors.description = t('form.validation.descriptionRequired');
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;
      onValidChange(isValid);
      return isValid;
    };

    useEffect(() => {
      validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleInputChange = (field: keyof RoleFormData, value: string | boolean) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (role) {
          // Update existing role
          await rolesService.updateRole(role.id, formData);
          toastService.success(t('messages.roleUpdated'));
        } else {
          // Create new role
          await rolesService.createRole(formData);
          toastService.success(t('messages.roleCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(role ? t('messages.errorUpdating') : t('messages.errorCreating'));
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit
    }));

    return (
      <div className="space-y-6">
        {/* Código y Descripción en columna vertical */}
        <div className="flex flex-col space-y-4">
          {/* Código */}
          <div>
            <Input
              label={t('form.code')}
              placeholder={t('form.placeholders.code')}
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={errors.code}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <Input
              label={t('form.description')}
              placeholder={t('form.placeholders.description')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              required
            />
          </div>
        </div>

        {/* Estado - en columna separada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Checkbox
              label={t('form.status')}
              checked={formData.status}
              onChange={(e) => handleInputChange('status', e.target.checked)}
            />
          </div>
        </div>
      </div>
    );
  }
);

RoleForm.displayName = 'RoleForm';

export default RoleForm; 