export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  code: string;
  description: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: boolean;
  created_at: string;
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum ExpenseRecurrence {
  NONE = 'none',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  expenseDate: string;
  dueDate?: string;
  status: ExpenseStatus;
  recurrence: ExpenseRecurrence;
  receiptPath?: string;
  notes?: string;
  reference?: string;
  providerId?: string;
  provider?: Provider;
  categoryId: number;
  category?: ExpenseCategory;
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

export interface CreateExpenseDto {
  description: string;
  amount: number;
  expenseDate: string;
  dueDate?: string;
  status?: ExpenseStatus;
  recurrence?: ExpenseRecurrence;
  notes?: string;
  providerId?: string;
  reference?: string;
  categoryId: number;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpensesSummary {
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface MonthlyExpense {
  month: number;
  totalAmount: number;
  expenseCount: number;
}

export interface ExpenseByCategory {
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  expenseCount: number;
}