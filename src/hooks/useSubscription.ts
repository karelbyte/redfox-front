import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();

  const tenant = params?.tenant as string;

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setSubscription(data);
      // Solo redirigir si no está activa Y no estamos ya en una ruta de suscripción
      if (!data.isActive && !pathname?.includes('/suscripcion')) {
        router.push(`/${tenant}/${locale}/dashboard/suscripcion/pago`);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await checkSubscription();
  };

  return {
    subscription,
    loading,
    isActive: subscription?.isActive || false,
    daysRemaining: subscription?.daysRemaining || 0,
    status: subscription?.status || null,
    refreshSubscription,
  };
}
