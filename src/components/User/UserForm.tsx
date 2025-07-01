'use client';

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Checkbox, SelectWithMultiple } from '@/components/atoms';
import { User, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import { Role } from '@/types/role';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { toastService } from '@/services/toast.service';

export interface UserFormRef {
  submit: () => void;
}

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (saving: boolean) => void;
  onValidChange: (valid: boolean) => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleIds: string[];
  status: boolean;
}

interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  roleIds?: string;
  status?: string;
}

const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ user, onSuccess, onSavingChange, onValidChange }, ref) => {
    const t = useTranslations('pages.users');
    const [formData, setFormData] = useState<UserFormData>({
      name: '',
      email: '',
      password: '',
      roleIds: [],
      status: true
    });
    const [errors, setErrors] = useState<UserFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    useEffect(() => {
      fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '', // No mostrar contraseña existente
          roleIds: user.roles.map(role => role.id),
          status: user.status
        });
      }
    }, [user]);

    useEffect(() => {
      onSavingChange(isSubmitting);
    }, [isSubmitting, onSavingChange]);

    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await rolesService.getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toastService.error(t('messages.errorLoadingRoles'));
      } finally {
        setLoadingRoles(false);
      }
    };

    const validateForm = (): boolean => {
      const newErrors: UserFormErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = t('form.validation.nameRequired');
      }

      if (!formData.email.trim()) {
        newErrors.email = t('form.validation.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('form.validation.emailInvalid');
      }

      if (!user && !formData.password.trim()) {
        newErrors.password = t('form.validation.passwordRequired');
      } else if (formData.password.trim() && formData.password.length < 6) {
        newErrors.password = t('form.validation.passwordMinLength');
      }

      if (formData.roleIds.length === 0) {
        newErrors.roleIds = t('form.validation.rolesRequired');
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

    const handleInputChange = (field: keyof UserFormData, value: string | boolean | string[]) => {
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
        if (user) {
          // Update existing user
          const updateData: UpdateUserRequest = {
            name: formData.name,
            email: formData.email,
            roleIds: formData.roleIds,
            status: formData.status
          };
          
          if (formData.password.trim()) {
            updateData.password = formData.password;
          }
          
          await usersService.updateUser(user.id, updateData);
          toastService.success(t('messages.userUpdated'));
        } else {
          // Create new user
          const createData: CreateUserRequest = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roleIds: formData.roleIds
          };
          
          await usersService.createUser(createData);
          toastService.success(t('messages.userCreated'));
        }

        onSuccess();
      } catch (error) {
        if (error instanceof Error) {
          toastService.error(error.message);
        } else {
          toastService.error(user ? t('messages.errorUpdating') : t('messages.errorCreating'));
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
        {/* Información básica */}
        <div className="flex flex-col space-y-4">
          {/* Nombre */}
          <div>
            <Input
              label={t('form.name')}
              placeholder={t('form.placeholders.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label={t('form.email')}
              placeholder={t('form.placeholders.email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              type="email"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <Input
              label={t('form.password')}
              placeholder={user ? t('form.placeholders.passwordOptional') : t('form.placeholders.password')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              type="password"
              required={!user}
            />
          </div>
        </div>

        {/* Roles y Estado */}
        <div className="flex flex-col space-y-4">
          {/* Roles */}
          <div>
            <SelectWithMultiple
              label={t('form.roles')}
              placeholder={t('form.placeholders.roles')}
              value={formData.roleIds}
              onChange={(value) => handleInputChange('roleIds', value)}
              error={errors.roleIds}
              required
              loading={loadingRoles}
              options={roles.map(role => ({
                value: role.id,
                label: `${role.code} - ${role.description}`
              }))}
            />
          </div>

          {/* Estado */}
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

UserForm.displayName = 'UserForm';

export default UserForm; 