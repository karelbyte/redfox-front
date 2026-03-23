'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionBlockerProps {
  children: React.ReactNode;
}

export function SubscriptionBlocker({ children }: SubscriptionBlockerProps) {
  const { subscription, loading, isActive } = useSubscription();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const pathname = usePathname();

  const tenant = params?.tenant as string;
  const isSubscriptionRoute = pathname?.includes('/suscripcion');

  useEffect(() => {
    if (!loading && subscription && !isActive && !isSubscriptionRoute) {
      router.push(`/${tenant}/${locale}/dashboard/suscripcion/pago`);
    }
  }, [loading, subscription, isActive, isSubscriptionRoute, router, tenant, locale]);

  // Rutas de suscripción siempre pasan
  if (isSubscriptionRoute) {
    return <>{children}</>;
  }

  // Mientras verifica o mientras redirige, mostrar spinner
  if (loading || !isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
