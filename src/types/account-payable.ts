import { Provider } from './provider';

export enum AccountPayableStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other'
}

export interface AccountPayablePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  accountPayableId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPayable {
  id: number;
  referenceNumber: string;
  providerId: string;
  provider?: Provider;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate: string;
  status: AccountPayableStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: AccountPayablePayment[];
}

export interface CreateAccountPayablePaymentDto {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}
