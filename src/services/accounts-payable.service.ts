import { api } from './api';
import { AccountPayable, AccountPayableStatus } from '@/types/account-payable';

export interface AccountsPayableResponse {
  data: AccountPayable[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccountsPayableSummary {
  totalAccounts: number;
  paidAccounts: number;
  pendingAccounts: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export const accountsPayableService = {
  async getAccountsPayable(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: AccountPayableStatus,
    providerId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AccountsPayableResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (providerId) params.append('providerId', providerId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<AccountsPayableResponse>(
      `/accounts-payable?${params.toString()}`
    );
    return response;
  },

  async getAccountPayable(id: number): Promise<AccountPayable> {
    const response = await api.get<AccountPayable>(`/accounts-payable/${id}`);
    return response;
  },

  async createAccountPayable(data: {
    referenceNumber: string;
    providerId: string;
    totalAmount: number;
    remainingAmount: number;
    issueDate: string;
    dueDate: string;
    status?: AccountPayableStatus;
    notes?: string;
  }): Promise<AccountPayable> {
    const response = await api.post<AccountPayable>('/accounts-payable', data);
    return response;
  },

  async updateAccountPayable(
    id: number,
    data: {
      referenceNumber?: string;
      providerId?: string;
      totalAmount?: number;
      remainingAmount?: number;
      issueDate?: string;
      dueDate?: string;
      status?: AccountPayableStatus;
      notes?: string;
    }
  ): Promise<AccountPayable> {
    const response = await api.patch<AccountPayable>(`/accounts-payable/${id}`, data);
    return response;
  },

  async deleteAccountPayable(id: number): Promise<void> {
    await api.delete(`/accounts-payable/${id}`);
  },

  async getAccountsPayableSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AccountsPayableSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<AccountsPayableSummary>(
      `/accounts-payable/summary?${params.toString()}`
    );
    return response;
  },
};
