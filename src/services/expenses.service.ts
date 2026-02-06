import { api } from './api';
import { 
  Expense, 
  ExpenseCategory, 
  CreateExpenseDto, 
  UpdateExpenseDto, 
  ExpensesSummary,
  MonthlyExpense,
  ExpenseByCategory,
  ExpenseStatus
} from '@/types/expense';

interface ExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const expensesService = {
  async getExpenses(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ExpenseStatus,
    categoryId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ExpensesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<ExpensesResponse>(`/expenses?${params.toString()}`);
    return response
  },

  async getExpense(id: number): Promise<Expense> {
    return await api.get(`/expenses/${id}`);
  },

  async createExpense(expense: CreateExpenseDto): Promise<Expense> {
    return await api.post('/expenses', expense as unknown as Record<string, unknown>);
  },

  async updateExpense(id: number, expense: UpdateExpenseDto): Promise<Expense> {
    return await api.patch(`/expenses/${id}`, expense);
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getExpensesSummary(startDate?: string, endDate?: string): Promise<ExpensesSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await api.get(`/expenses/summary?${params.toString()}`);
  },

  async getMonthlyExpenses(year: number): Promise<MonthlyExpense[]> {
    return await api.get(`/expenses/monthly/${year}`);
  },

  async getExpensesByCategory(startDate?: string, endDate?: string): Promise<ExpenseByCategory[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await api.get(`/expenses/by-category?${params.toString()}`);
  },

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await api.get('/expense-categories');
  },

  async createExpenseCategory(category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseCategory> {
    return await api.post('/expense-categories', category);
  },

  async updateExpenseCategory(id: number, category: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    return await api.patch(`/expense-categories/${id}`, category);
  },

  async deleteExpenseCategory(id: number): Promise<void> {
    await api.delete(`/expense-categories/${id}`);
  },
};