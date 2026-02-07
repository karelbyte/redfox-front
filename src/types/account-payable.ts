import { Provider } from './provider';

export enum AccountPayableStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
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
}
