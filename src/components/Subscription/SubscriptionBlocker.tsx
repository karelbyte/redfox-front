'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionBlockerProps {
  children: React.ReactNode;
}

export function SubscriptionBlocker({ children }: SubscriptionBlockerProps) {
  const { subscription, loading, isActive } = useSubscription();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('subscription.blocker');

  const tenant = params?.tenant as string;

  const getSubscriptionUrl = (path: string) => {
    return `/${tenant}/${locale}/dashboard/suscripcion${path}`;
  };

  useEffect(() => {
    if (!loading && subscription && !isActive) {
      // Redirigir a página de pago si la suscripción no está activa
      router.push(getSubscriptionUrl('/pago'));
    }
  }, [loading, subscription, isActive, router, tenant, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('verifying')}</p>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div
          className="max-w-md w-full rounded-lg p-8 text-center"
          style={{
            backgroundColor: 'white',
            border: `1px solid rgb(var(--color-secondary-200))`,
          }}
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'rgb(var(--color-primary-600))' }}
          >
            {t('title')}
          </h2>
          <p className="mb-6" style={{ color: 'rgb(var(--color-secondary-600))' }}>
            {t('message')}
          </p>
          <button
            onClick={() => router.push(getSubscriptionUrl('/pago'))}
            className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ backgroundColor: 'rgb(var(--color-primary-500))' }}
          >
            {t('activate')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
