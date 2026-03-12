'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StripeProvider } from '@/providers/StripeProvider';
import { PaymentForm } from '@/components/Subscription/PaymentForm';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';
import { toastService } from '@/services/toast.service';

interface Plan {
  id: string;
  name: string;
  price: string;
  currency: string;
  billing_period: string;
  description: string;
}

export default function PaymentPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('subscription.payment');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subscriptionData, plansData] = await Promise.all([
        subscriptionService.getStatus(),
        subscriptionService.getPlans(),
      ]);
      setSubscription(subscriptionData);
      setPlans(plansData);
      
      // Seleccionar el plan actual o el primero por defecto
      if (subscriptionData.plan) {
        const currentPlan = plansData.find((p: Plan) => p.id === subscriptionData.plan.id);
        setSelectedPlan(currentPlan || plansData[0]);
      } else {
        setSelectedPlan(plansData[0]);
      }
    } catch (error) {
      toastService.error(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--color-primary-600))' }}>
        {t('title')}
      </h1>
      <p className="mb-8" style={{ color: 'rgb(var(--color-secondary-600))' }}>
        {t('subtitle')}
      </p>

      {/* Selección de Plan */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('selectPlan')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? 'ring-2 ring-primary-500'
                  : 'hover:ring-2 hover:ring-primary-200'
              }`}
              style={{
                backgroundColor: 'white',
                border: `2px solid ${
                  selectedPlan?.id === plan.id
                    ? 'rgb(var(--color-primary-500))'
                    : 'rgb(var(--color-secondary-200))'
                }`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                    {plan.description}
                  </p>
                </div>
                {selectedPlan?.id === plan.id && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                  ${plan.price}
                </span>
                <span className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                  {plan.currency}/{plan.billing_period === 'monthly' ? t('perMonth') : t('perYear')}
                </span>
              </div>
              {plan.billing_period === 'yearly' && (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {t('saveMore')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen del Plan Seleccionado */}
      {selectedPlan && (
        <div
          className="rounded-lg p-6 mb-6"
          style={{
            backgroundColor: 'white',
            border: `1px solid rgb(var(--color-secondary-200))`,
          }}
        >
          <h2 className="text-lg font-semibold mb-4">{t('planSummary')}</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">{selectedPlan.name}</h3>
              <p className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                {selectedPlan.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                ${selectedPlan.price}
              </div>
              <div className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                {selectedPlan.currency}/{selectedPlan.billing_period === 'monthly' ? t('perMonth') : t('perYear')}
              </div>
            </div>
          </div>

          <div
            className="pt-4"
            style={{ borderTop: `1px solid rgb(var(--color-secondary-200))` }}
          >
            <h4 className="font-semibold mb-2">{t('includes')}</h4>
            <ul className="space-y-1 text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
              <li>✓ {t('feature1')}</li>
              <li>✓ {t('feature2')}</li>
              <li>✓ {t('feature3')}</li>
              <li>✓ {t('feature4')}</li>
              <li>✓ {t('feature5')}</li>
              <li>✓ {t('feature6')}</li>
              <li>✓ {t('feature7')}</li>
              <li>✓ {t('feature8')}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Formulario de Pago */}
      {selectedPlan && (
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: 'white',
            border: `1px solid rgb(var(--color-secondary-200))`,
          }}
        >
          <h2 className="text-lg font-semibold mb-4">{t('paymentInfo')}</h2>
          <StripeProvider>
            <PaymentForm planId={selectedPlan.id} />
          </StripeProvider>
        </div>
      )}

      {/* Información de Seguridad */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'rgb(var(--color-secondary-500))' }}>
          {t('securityNote')}
          <br />
          {t('securityNote2')}
        </p>
      </div>
    </div>
  );
}
