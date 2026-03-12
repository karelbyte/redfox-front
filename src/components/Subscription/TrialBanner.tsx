'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';
import { useRouter, useParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function TrialBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('subscription.banner');

  const tenant = params?.tenant as string;

  const getSubscriptionUrl = (path: string) => {
    return `/${tenant}/${locale}/dashboard/suscripcion${path}`;
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription || dismissed) {
    return null;
  }

  // No mostrar si la suscripción está activa y no es trial
  if (subscription.status === 'active' && subscription.status !== 'trial') {
    return null;
  }

  // No mostrar si no está en período de prueba
  if (subscription.status !== 'trial') {
    return null;
  }

  const daysRemaining = subscription.daysRemaining;
  const isUrgent = daysRemaining <= 3;
  const isExpired = daysRemaining <= 0;

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800 truncate">
            {t('trialExpired')}
          </p>
        </div>
        <button
          onClick={() => router.push(getSubscriptionUrl('/pago'))}
          className="px-4 py-1.5 text-sm rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition-all whitespace-nowrap"
        >
          {t('activateNow')}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-md transition-all hover:bg-gray-100"
          aria-label={t('close')}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div 
        onClick={() => router.push(getSubscriptionUrl(''))}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="text-lg">{isUrgent ? '⏰' : '🎉'}</span>
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm font-semibold truncate"
            style={{
              color: isUrgent ? 'rgb(var(--color-orange-800))' : 'rgb(var(--color-primary-800))',
            }}
          >
            {isUrgent
              ? t('trialUrgent', { days: daysRemaining })
              : t('trialRemaining', { days: daysRemaining })}
          </p>
          <p className="text-xs text-gray-500">
            {t('clickToViewDetails')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isUrgent && (
          <button
            onClick={() => router.push(getSubscriptionUrl('/pago'))}
            className="px-4 py-1.5 text-sm rounded-md font-semibold text-white transition-all whitespace-nowrap"
            style={{ backgroundColor: 'rgb(var(--color-orange-600))' }}
          >
            {t('activateSubscription')}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-md transition-all hover:bg-gray-100"
          aria-label={t('close')}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
