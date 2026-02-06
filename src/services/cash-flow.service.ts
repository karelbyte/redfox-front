import { api } from './api';

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  accountsReceivableAmount: number;
  accountsPayableAmount: number;
  projectedBalance: number;
}

export interface CashFlowMovement {
  date: string;
  type: 'income' | 'expense' | 'receivable' | 'payable';
  description: string;
  amount: number;
  balance: number;
  reference?: string;
}

export interface CashFlowProjection {
  period: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
}

export const cashFlowService = {
  async getSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<CashFlowSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<CashFlowSummary>(
      `/cash-flow/summary?${params.toString()}`
    );
    return response;
  },

  async getMovements(
    startDate?: string,
    endDate?: string,
    limit: number = 50,
  ): Promise<CashFlowMovement[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<CashFlowMovement[]>(
      `/cash-flow/movements?${params.toString()}`
    );
    return response;
  },

  async getProjection(months: number = 3): Promise<CashFlowProjection[]> {
    const params = new URLSearchParams({
      months: months.toString(),
    });

    const response = await api.get<CashFlowProjection[]>(
      `/cash-flow/projection?${params.toString()}`
    );
    return response;
  },
};
