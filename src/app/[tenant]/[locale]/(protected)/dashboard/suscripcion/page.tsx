'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';
import { referralService, MyReferrer, MyCommission } from '@/services/referral.service';
import { useRouter, useParams } from 'next/navigation';
import { toastService } from '@/services/toast.service';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [referrer, setReferrer] = useState<MyReferrer | null>(null);
  const [commissions, setCommissions] = useState<MyCommission[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('subscription.page');

  const tenant = params?.tenant as string;

  useEffect(() => {
    fetchSubscription();
    fetchReferral();
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

  const fetchReferral = async () => {
    setLoadingReferral(true);
    try {
      const data = await referralService.getMyCommissions();
      if (data.referrer) {
        setReferrer(data.referrer);
        setCommissions(data.commissions);
        setReferralStats(data.stats);
      } else {
        // Crear código automáticamente al visitar la página
        const r = await referralService.getMyCode();
        setReferrer(r);
        setCommissions([]);
        setReferralStats({ total: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0, paidAmount: 0 });
      }
    } catch {
      // silencioso — no bloquear la página
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleCopyCode = () => {
    if (!referrer) return;
    navigator.clipboard.writeText(referrer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="rounded-lg p-6 mb-6"
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

      {/* Programa de Referidos */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'white', border: `1px solid rgb(var(--color-secondary-200))` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'rgb(var(--color-primary-50))' }}>
            🤝
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {locale === 'zh' ? '推荐计划' : locale === 'en' ? 'Referral Program' : 'Programa de Referidos'}
            </h2>
            <p className="text-sm" style={{ color: 'rgb(var(--color-secondary-500))' }}>
              {locale === 'zh' ? '分享您的推荐码，每次成功推荐获得 10% 佣金' : locale === 'en' ? 'Share your code and earn 10% commission per successful referral' : 'Comparte tu código y gana 10% de comisión por cada referido que pague'}
            </p>
          </div>
        </div>

        {loadingReferral ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full" />
            {locale === 'zh' ? '加载中...' : locale === 'en' ? 'Loading...' : 'Cargando...'}
          </div>
        ) : referrer ? (
          <>
            {/* Código */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed" style={{ borderColor: 'rgb(var(--color-primary-300))', backgroundColor: 'rgb(var(--color-primary-50))' }}>
                <span className="font-mono text-2xl font-bold tracking-widest" style={{ color: 'rgb(var(--color-primary-700))' }}>
                  {referrer.code}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all"
                style={{ backgroundColor: copied ? '#10b981' : 'rgb(var(--color-primary-600))', color: 'white' }}
              >
                {copied
                  ? <><CheckIcon className="h-4 w-4" />{locale === 'zh' ? '已复制' : locale === 'en' ? 'Copied!' : '¡Copiado!'}</>
                  : <><ClipboardDocumentIcon className="h-4 w-4" />{locale === 'zh' ? '复制' : locale === 'en' ? 'Copy' : 'Copiar'}</>
                }
              </button>
            </div>

            {/* Stats */}
            {referralStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: locale === 'zh' ? '总推荐' : locale === 'en' ? 'Total' : 'Total', value: referralStats.total },
                  { label: locale === 'zh' ? '待处理' : locale === 'en' ? 'Pending' : 'Pendientes', value: referralStats.pending, color: 'text-yellow-600' },
                  { label: locale === 'zh' ? '已批准' : locale === 'en' ? 'Approved' : 'Aprobadas', value: referralStats.approved, color: 'text-blue-600' },
                  { label: locale === 'zh' ? '已付款' : locale === 'en' ? 'Paid' : 'Pagadas', value: referralStats.paid, color: 'text-green-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Monto ganado */}
            {referralStats && (referralStats.totalAmount > 0) && (
              <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-6" style={{ backgroundColor: 'rgb(var(--color-primary-50))' }}>
                <span className="text-sm font-medium" style={{ color: 'rgb(var(--color-primary-700))' }}>
                  {locale === 'zh' ? '总佣金' : locale === 'en' ? 'Total earned' : 'Total ganado'}
                </span>
                <span className="text-lg font-bold" style={{ color: 'rgb(var(--color-primary-700))' }}>
                  ${Number(referralStats.totalAmount).toFixed(2)}
                  <span className="text-sm font-normal ml-2 text-green-600">
                    (${Number(referralStats.paidAmount).toFixed(2)} {locale === 'zh' ? '已付' : locale === 'en' ? 'paid' : 'pagado'})
                  </span>
                </span>
              </div>
            )}

            {/* Historial de comisiones */}
            {commissions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {locale === 'zh' ? '佣金历史' : locale === 'en' ? 'Commission history' : 'Historial de comisiones'}
                </h3>
                <div className="space-y-2">
                  {commissions.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">{c.organization?.name}</span>
                        <span className="text-gray-400 ml-2 text-xs">{c.plan_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-700">${Number(c.commission_amount).toFixed(2)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'paid' ? 'bg-green-100 text-green-700' :
                          c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status === 'paid'
                            ? (locale === 'zh' ? '已付款' : locale === 'en' ? 'Paid' : 'Pagada')
                            : c.status === 'approved'
                            ? (locale === 'zh' ? '已批准' : locale === 'en' ? 'Approved' : 'Aprobada')
                            : (locale === 'zh' ? '待处理' : locale === 'en' ? 'Pending' : 'Pendiente')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {commissions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                {locale === 'zh' ? '暂无佣金记录。分享您的推荐码开始赚取！' : locale === 'en' ? 'No commissions yet. Share your code to start earning!' : 'Aún no tienes comisiones. ¡Comparte tu código para empezar a ganar!'}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
