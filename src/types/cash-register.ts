export interface CashRegister {
  id: string;
  code: string;
  name: string;
  description: string;
  initial_amount: number;
  current_amount: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  opened_by: string;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashTransaction {
  id: string;
  cash_register_id: string;
  type: 'sale' | 'refund' | 'adjustment' | 'withdrawal' | 'deposit';
  amount: number;
  description: string;
  reference: string;
  payment_method: 'cash' | 'card' | 'mixed';
  sale_id?: string;
  created_by: string;
  created_at: string;
}

export interface CashRegisterBalance {
  current_amount: number;
  total_transactions: number;
  last_transaction_at: string | null;
}

export interface CashReport {
  total_sales: number;
  total_refunds: number;
  total_adjustments: number;
  cash_sales: number;
  card_sales: number;
  opening_balance: number;
  closing_balance: number;
  transactions: CashTransaction[];
} 