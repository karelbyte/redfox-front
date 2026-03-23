'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('[StripeProvider] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return null;
    }
    return loadStripe(key);
  }, []);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
