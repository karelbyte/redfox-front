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

  async getPlans(): Promise<Plan[]> {
    return await api.get<Plan[]>('/subscriptions/plans');
  },
};
