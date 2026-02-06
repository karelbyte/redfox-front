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
