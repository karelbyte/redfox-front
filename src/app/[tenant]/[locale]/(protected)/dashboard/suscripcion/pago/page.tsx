'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocaleUtils } from '@/hooks/useLocale';
import { subscriptionService, SubscriptionStatus, Plan } from '@/services/subscription.service';
import { toastService } from '@/services/toast.service';

export default function PaymentPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('subscription.payment');
  const { formatCurrency } = useLocaleUtils();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Meses que se ahorran contratando un plan anual, comparado con pagar el
   * mensual doce veces. Se calcula a partir de los precios reales en lugar de
   * anunciarlo con un texto fijo, para que nunca prometa de más ni de menos
   * cuando cambien los importes o el país.
   *
   * Se redondea a la baja: mejor quedarse corto que exagerar.
   */
  const savedMonths = (plan: Plan): number => {
    if (plan.billing_period !== 'yearly') return 0;

    const monthly = plans.find(
      (p) => p.billing_period === 'monthly' && p.currency === plan.currency,
    );
    if (!monthly || Number(monthly.price) <= 0) return 0;

    const saved = Number(monthly.price) * 12 - Number(plan.price);

    return Math.max(0, Math.floor(saved / Number(monthly.price)));
  };

  /**
   * La descripción del plan se guarda en la base en un solo idioma, así que
   * solo se usa si el plan trae una propia; si no, se traduce, igual que la
   * lista de características.
   */
  const planDescription = (plan: Plan): string =>
    plan.description?.trim() ||
    t(plan.billing_period === 'yearly' ? 'descriptionYearly' : 'descriptionMonthly');

  /**
   * Lleva al usuario a la pantalla de pago de Stripe.
   *
   * No se limpia `redirecting` al terminar a propósito: si todo va bien el
   * navegador ya está saliendo de esta página, y devolver el botón a su
   * estado normal solo daría lugar a un segundo clic durante la redirección.
   */
  const goToCheckout = async () => {
    if (!selectedPlan) return;
    setRedirecting(true);

    try {
      const { url } = await subscriptionService.createCheckoutSession(selectedPlan.id);
      window.location.href = url;
    } catch (error) {
      toastService.error(t('checkoutError'));
      setRedirecting(false);
    }
  };

  const fetchData = async () => {
    try {
      const [subscriptionData, plansData] = await Promise.all([
        subscriptionService.getStatus(),
        subscriptionService.getPlans(),
      ]);
      setSubscription(subscriptionData);
      setPlans(plansData);
      
      // Preseleccionar: primero buscar plan default, luego el actual, luego el primero
      if (subscriptionData.plan) {
        const currentPlan = plansData.find((p: Plan) => p.id === subscriptionData.plan!.id);
        if (currentPlan) {
          setSelectedPlan(currentPlan);
        } else {
          const defaultPlan = plansData.find((p: Plan) => p.is_default) || plansData[0];
          setSelectedPlan(defaultPlan);
        }
      } else {
        const defaultPlan = plansData.find((p: Plan) => p.is_default) || plansData[0];
        setSelectedPlan(defaultPlan);
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.is_default && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                        {t('recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                    {planDescription(plan)}
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
                  {formatCurrency(Number(plan.price), plan.currency)}
                </span>
                <span className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                  /{plan.billing_period === 'monthly' ? t('perMonth') : t('perYear')}
                </span>
              </div>
              {savedMonths(plan) > 0 && (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {t('saveMonths', { months: savedMonths(plan) })}
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
                {planDescription(selectedPlan)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'rgb(var(--color-primary-600))' }}>
                {formatCurrency(Number(selectedPlan.price), selectedPlan.currency)}
              </div>
              <div className="text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                /{selectedPlan.billing_period === 'monthly' ? t('perMonth') : t('perYear')}
              </div>
            </div>
          </div>

          <div
            className="pt-4"
            style={{ borderTop: `1px solid rgb(var(--color-secondary-200))` }}
          >
            <h4 className="font-semibold mb-2">{t('includes')}</h4>
            {selectedPlan.features && selectedPlan.features.length > 0 ? (
              <ul className="space-y-1 text-sm" style={{ color: 'rgb(var(--color-secondary-600))' }}>
                {selectedPlan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
            ) : (
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
            )}
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
          <p className="text-sm mb-4" style={{ color: 'rgb(var(--color-secondary-600))' }}>
            {t('checkoutNote')}
          </p>
          <button
            type="button"
            onClick={goToCheckout}
            disabled={redirecting}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'rgb(var(--color-primary-600))' }}
          >
            {redirecting ? t('redirecting') : t('goToCheckout')}
          </button>
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
