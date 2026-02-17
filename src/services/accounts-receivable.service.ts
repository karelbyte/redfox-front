import { api } from './api';
import { 
  AccountReceivable, 
  CreateAccountReceivableDto, 
  UpdateAccountReceivableDto,
  CreateAccountReceivablePaymentDto,
  AccountReceivablePayment,
  AccountsReceivableSummary,
  AccountReceivableStatus
} from '@/types/account-receivable';
import { PaginatedResponse } from '@/types/api';

export const accountsReceivableService = {
  async getAccountsReceivable(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: AccountReceivableStatus,
    clientId?: number,
    overdue?: boolean
  ): Promise<{
    data: AccountReceivable[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (clientId) params.append('clientId', clientId.toString());
    if (overdue) params.append('overdue', 'true');

    const response = await api.get(`/accounts-receivable?${params.toString()}`);
    return response as any;
  },

  async getAccountReceivable(id: number): Promise<AccountReceivable> {
    const response = await api.get(`/accounts-receivable/${id}`);
    return response as AccountReceivable;
  },

  async createAccountReceivable(account: CreateAccountReceivableDto): Promise<AccountReceivable> {
    const response = await api.post('/accounts-receivable', account as any);
    return response as AccountReceivable;
  },

  async updateAccountReceivable(id: number, account: UpdateAccountReceivableDto): Promise<AccountReceivable> {
    const response = await api.patch(`/accounts-receivable/${id}`, account as any);
    return response as AccountReceivable;
  },

  async deleteAccountReceivable(id: number): Promise<void> {
    await api.delete(`/accounts-receivable/${id}`);
  },

  async addPayment(accountId: number, payment: Omit<CreateAccountReceivablePaymentDto, 'accountReceivableId'>): Promise<AccountReceivablePayment> {
    const response = await api.post(`/accounts-receivable/${accountId}/payments`, payment as any);
    return response as AccountReceivablePayment;
  },

  async getAccountsReceivableSummary(): Promise<AccountsReceivableSummary> {
    const response = await api.get('/accounts-receivable/summary');
    return response as AccountsReceivableSummary;
  },

  async getOverdueAccounts(): Promise<AccountReceivable[]> {
    const response = await api.get('/accounts-receivable/overdue');
    return response as AccountReceivable[];
  },

  async updateOverdueStatus(): Promise<void> {
    await api.post('/accounts-receivable/update-overdue-status', {});
  },

  async getClientCreditAnalysis(clientId: string): Promise<{
    totalCredit: number;
    usedCredit: number;
    availableCredit: number;
    overdueBalance: number;
    currentBalance: number;
    accounts: Array<{
      id: number;
      referenceNumber: string;
      issueDate: Date;
      dueDate: Date;
      totalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      status: AccountReceivableStatus;
      daysOverdue: number;
      agingCategory: string;
    }>;
  }> {
    const response = await api.get(`/accounts-receivable/client/${clientId}/analysis`);
    return response as any;
  },
};