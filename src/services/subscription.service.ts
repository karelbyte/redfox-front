import { api } from './api';

export interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  status: string | null;
  daysRemaining: number;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billing_period: string;
    description: string;
  } | null;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
}

export interface Plan {
  id: string;
  name: string;
  version: string;
  price: number;
  currency: string;
  billing_period: string;
  description: string;
  features: string[];
  is_default: boolean;
  is_active: boolean;
}

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionStatus> {
    return await api.get<SubscriptionStatus>('/subscriptions/status');
  },

  async convertTrial(paymentMethodId: string, planId?: string) {
    return await api.post('/subscriptions/convert-trial', {
      paymentMethodId,
      planId,
    });
  },

  async confirmPayment(subscriptionId: string) {
    return await api.post(`/subscriptions/confirm-payment/${subscriptionId}`, {
      subscriptionId,
    });
  },

  /**
   * Pide la pantalla de pago alojada por Stripe. El navegador sale de la
   * aplicación: ningún dato de tarjeta pasa por aquí, que es justamente lo
   * que hace que no haya nada sensible que proteger en este código.
   */
  async createCheckoutSession(planId?: string): Promise<{ url: string }> {
    return await api.post<{ url: string }>('/subscriptions/checkout-session', {
      planId,
    });
  },

  /**
   * Pide el portal donde el cliente gestiona su suscripción. No se le envía
   * ningún identificador: el backend lo resuelve desde la sesión.
   */
  async createPortalSession(): Promise<{ url: string }> {
    return await api.post<{ url: string }>('/subscriptions/portal-session', {});
  },

  async getPlans(): Promise<Plan[]> {
    return await api.get<Plan[]>('/subscriptions/plans');
  },

  async processManualPayment(subscriptionId: string, amount?: number, notes?: string) {
    return await api.post(`/admin/subscriptions/${subscriptionId}/manual-payment`, {
      amount,
      notes,
    });
  },
};
