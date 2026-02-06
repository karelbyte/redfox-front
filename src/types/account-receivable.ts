export enum AccountReceivableStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other'
}

export interface AccountReceivablePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  accountReceivableId: number;
  createdBy: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AccountReceivable {
  id: number;
  referenceNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate: string;
  status: AccountReceivableStatus;
  notes?: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  invoiceId?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
  };
  payments?: AccountReceivablePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountReceivableDto {
  referenceNumber: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status?: AccountReceivableStatus;
  notes?: string;
  clientId: string;
  invoiceId?: string;
}

export interface UpdateAccountReceivableDto extends Partial<CreateAccountReceivableDto> {}

export interface CreateAccountReceivablePaymentDto {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  accountReceivableId: number;
}

export interface AccountsReceivableSummary {
  totalAccounts: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
}