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
  ): Promise<PaginatedResponse<AccountReceivable>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (clientId) params.append('clientId', clientId.toString());
    if (overdue) params.append('overdue', 'true');

    const response = await api.get(`/accounts-receivable?${params.toString()}`);
    return response.data;
  },

  async getAccountReceivable(id: number): Promise<AccountReceivable> {
    const response = await api.get(`/accounts-receivable/${id}`);
    return response.data;
  },

  async createAccountReceivable(account: CreateAccountReceivableDto): Promise<AccountReceivable> {
    const response = await api.post('/accounts-receivable', account);
    return response.data;
  },

  async updateAccountReceivable(id: number, account: UpdateAccountReceivableDto): Promise<AccountReceivable> {
    const response = await api.patch(`/accounts-receivable/${id}`, account);
    return response.data;
  },

  async deleteAccountReceivable(id: number): Promise<void> {
    await api.delete(`/accounts-receivable/${id}`);
  },

  async addPayment(accountId: number, payment: Omit<CreateAccountReceivablePaymentDto, 'accountReceivableId'>): Promise<AccountReceivablePayment> {
    const response = await api.post(`/accounts-receivable/${accountId}/payments`, payment);
    return response.data;
  },

  async getAccountsReceivableSummary(): Promise<AccountsReceivableSummary> {
    const response = await api.get('/accounts-receivable/summary');
    return response.data;
  },

  async getOverdueAccounts(): Promise<AccountReceivable[]> {
    const response = await api.get('/accounts-receivable/overdue');
    return response.data;
  },

  async updateOverdueStatus(): Promise<void> {
    await api.post('/accounts-receivable/update-overdue-status');
  },
};