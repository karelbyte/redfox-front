'use client'

import EmailConfigForm from '@/components/EmailConfig/EmailConfigForm';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';
import EmptyState from '@/components/atoms/EmptyState';

export default function EmailConfigPage() {
  const { can } = usePermissions();
  const t = useTranslations('common');

  if (!can(['email_config_module_view'])) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title={t('noPermission')}
            description={t('noPermissionDescription')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <EmailConfigForm />
      </div>
    </div>
  );
} 