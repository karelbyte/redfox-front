import { api } from './api';

export interface MyReferrer {
  id: string;
  code: string;
  name: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface MyCommission {
  id: string;
  organization: { id: string; name: string; slug: string };
  plan_name: string;
  plan_price: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface MyReferralData {
  referrer: MyReferrer | null;
  commissions: MyCommission[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    totalAmount: number;
    paidAmount: number;
  };
}

class ReferralService {
  async getMyCode(): Promise<MyReferrer> {
    return api.get<MyReferrer>('/referrals/me/code');
  }

  async getMyCommissions(): Promise<MyReferralData> {
    return api.get<MyReferralData>('/referrals/me/commissions');
  }
}

export const referralService = new ReferralService();
