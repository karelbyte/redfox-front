'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Loader2 } from 'lucide-react';
import { subscriptionService } from '@/services/subscription.service';
import { toastService } from '@/services/toast.service';
import { useRouter, useParams } from 'next/navigation';

export interface PaymentFormProps {
  planId?: string;
}

export function PaymentForm({ planId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('subscription.paymentForm');

  const tenant = params?.tenant as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[PaymentForm] Submit started', { planId, stripe: !!stripe, elements: !!elements });
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      console.error('[PaymentForm] Stripe or elements not loaded');
      setError(t('stripeNotLoaded'));
      setLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        console.error('[PaymentForm] Card element not found');
        setError(t('formNotLoaded'));
        setLoading(false);
        return;
      }

      console.log('[PaymentForm] Creating payment method...');
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        console.error('[PaymentForm] Stripe error:', stripeError);
        setError(stripeError.message || t('paymentError'));
        setLoading(false);
        return;
      }

      if (paymentMethod) {
        console.log('[PaymentForm] Payment method created:', paymentMethod.id);
        console.log('[PaymentForm] Converting trial with planId:', planId);
        const result = await subscriptionService.convertTrial(paymentMethod.id, planId);
        console.log('[PaymentForm] Convert trial result:', result);

        if (result && typeof result === 'object' && 'clientSecret' in result && 'subscriptionId' in result) {
          console.log('[PaymentForm] Confirming card payment...');
          // Confirmar el pago en Stripe
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret as string);

          if (confirmError) {
            console.error('[PaymentForm] Confirm error:', confirmError);
            setError(confirmError.message || t('confirmError'));
            setLoading(false);
            return;
          }

          // Si el pago fue exitoso, confirmar en el backend
          if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('[PaymentForm] Payment succeeded, confirming in backend...');
            await subscriptionService.confirmPayment(result.subscriptionId as string);
            toastService.success(t('paymentSuccess'));
            router.push(`/${tenant}/${locale}/dashboard/suscripcion`);
          } else {
            console.error('[PaymentForm] Payment intent status:', paymentIntent?.status);
            setError(t('paymentError'));
            setLoading(false);
          }
        }
      }
    } catch (err: any) {
      console.error('[PaymentForm] Error:', err);
      setError(err.message || t('paymentError'));
      toastService.error(t('paymentError'));
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-secondary-700))' }}>
          {t('cardInfo')}
        </label>
        <div
          className="p-4 rounded-lg"
          style={{
            border: `1px solid rgb(var(--color-secondary-300))`,
            backgroundColor: 'white',
          }}
        >
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'rgb(var(--color-red-50))',
            border: `1px solid rgb(var(--color-red-200))`,
          }}
        >
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Debug info */}
      {!stripe && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">⚠️ Stripe is loading... Please wait.</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'rgb(var(--color-primary-500))' }}
          onClick={() => console.log('[PaymentForm] Button clicked', { stripe: !!stripe, loading })}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {t('processing')}
            </span>
          ) : (
            t('payNow')
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs flex items-center justify-center gap-1" style={{ color: 'rgb(var(--color-secondary-500))' }}>
          <Lock className="h-3 w-3" />
          {t('securePayment')}
        </p>
      </div>
    </form>
  );
}

