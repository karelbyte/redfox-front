import { Provider } from './provider';

export enum AccountPayableStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
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
