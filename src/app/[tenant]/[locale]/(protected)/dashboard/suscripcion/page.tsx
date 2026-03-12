'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';
import { useRouter, useParams } from 'next/navigation';
import { toastService } from '@/services/toast.service';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('subscription.page');

  const tenant = params?.tenant as string;

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setSubscription(data);
    } catch (error) {
      toastService.error(t('errorLoadingSubscription'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentUrl = () => {
    return `/${tenant}/${locale}/dashboard/suscripcion/pago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'rgb(var(--color-primary-600))' }}>
        {t('title')}
      </h1>

      {/* Estado de Suscripción */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{
          backgroundColor: 'white',
          border: `1px solid rgb(var(--color-secondary-200))`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('currentStatus')}</h2>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              subscription.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {subscription.isActive ? t('active') : t('inactive')}
          </span>
        </div>

        {subscription.status === 'trial' && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: 'rgb(var(--color-primary-50))',
              border: `2px solid rgb(var(--color-primary-500))`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎉</div>
              <div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: 'rgb(var(--color-primary-600))' }}
                >
                  {t('trialPeriod')}
                </h3>
                <p className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                  {t('daysRemaining', { days: subscription.daysRemaining })}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgb(var(--color-secondary-500))' }}>
                  {t('endsOn', { date: formatDate(subscription.trialEndDate) })}
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription.status === 'active' && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: 'rgb(var(--color-green-50))',
              border: `1px solid rgb(var(--color-green-200))`,
            }}
          >
            <h3 className="font-semibold text-green-800 mb-2">{t('activeSubscription')}</h3>
            <p className="text-sm text-green-700">
              {t('nextRenewal', { date: formatDate(subscription.subscriptionEndDate) })}
            </p>
          </div>
        )}

        {!subscription.isActive && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: 'rgb(var(--color-red-50))',
              border: `1px solid rgb(var(--color-red-200))`,
            }}
          >
            <h3 className="font-semibold text-red-800 mb-2">{t('expiredSubscription')}</h3>
            <p className="text-sm text-red-700">
              {t('expiredMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Información del Plan */}
      {subscription.plan && (
        <div
          className="rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'white',
            border: `1px solid rgb(var(--color-secondary-200))`,
          }}
        >
          <h2 className="text-xl font-semibold mb-4">{t('currentPlan')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
              <p className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                {subscription.plan.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                ${subscription.plan.price}
              </div>
              <div className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                {subscription.plan.currency}/{subscription.plan.billing_period === 'monthly' ? t('perMonth') : t('perYear')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Pago - Siempre visible si está en trial o expirado */}
      {(subscription.status === 'trial' || !subscription.isActive) && (
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: 'white',
            border: `1px solid rgb(var(--color-secondary-200))`,
          }}
        >
          <h2 className="text-xl font-semibold mb-4">
            {subscription.status === 'trial' ? t('activateYourSubscription') : t('renewSubscription')}
          </h2>
          <p className="mb-4" style={{ color: 'rgb(var(--color-secondary-600))' }}>
            {subscription.status === 'trial' ? t('trialEndingSoon') : t('renewMessage')}
          </p>
          <button
            onClick={() => router.push(getPaymentUrl())}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgb(var(--color-primary-500))' }}
          >
            {subscription.status === 'trial' ? t('activateSubscription') : t('renewNow')}
          </button>
        </div>
      )}
    </div>
  );
}
