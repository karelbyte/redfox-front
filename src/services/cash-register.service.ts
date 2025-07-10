import { api } from './api';
import { CashRegister, CashTransaction } from '@/types/cash-register';
import { toastService } from './toast.service';

interface PaginatedCashRegisterResponse {
  data: CashRegister[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PaginatedCashTransactionResponse {
  data: CashTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CashRegisterBalance {
  current_amount: number;
  total_transactions: number;
  last_transaction_at: string | null;
}

class CashRegisterService {
  // Cash Register operations
  async getCashRegisters(page?: number, limit?: number, term?: string): Promise<PaginatedCashRegisterResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (term) params.append('term', term);
    
    const queryString = params.toString();
    const url = `/cash-registers${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedCashRegisterResponse>(url);
    return response;
  }

  async getCashRegister(id: string): Promise<CashRegister> {
    const response = await api.get<CashRegister>(`/cash-registers/${id}`);
    return response;
  }

  async createCashRegister(data: { name: string; description?: string; initial_amount: number }): Promise<CashRegister> {
    const response = await api.post<CashRegister>('/cash-registers', data);
    toastService.success('Caja registradora creada exitosamente');
    return response;
  }

  async updateCashRegister(id: string, data: Partial<CashRegister>): Promise<CashRegister> {
    const response = await api.put<CashRegister>(`/cash-registers/${id}`, data);
    toastService.success('Caja registradora actualizada exitosamente');
    return response;
  }

  async deleteCashRegister(id: string): Promise<void> {
    await api.delete(`/cash-registers/${id}`);
    toastService.success('Caja registradora eliminada exitosamente');
  }

  async openCashRegister(initialAmount: number, name?: string, description?: string): Promise<CashRegister> {
    const data = {
      initial_amount: initialAmount,
      name: name || 'Caja Principal',
      description: description || 'Caja registradora principal'
    };
    
    const response = await api.post<CashRegister>('/cash-registers/open', data);
    toastService.success('Caja abierta exitosamente');
    return response;
  }

  async closeCashRegister(id: string, finalAmount: number, description?: string): Promise<CashRegister> {
    const data = {
      final_amount: finalAmount,
      description: description || 'Cierre de caja'
    };
    
    const response = await api.post<CashRegister>(`/cash-registers/${id}/close`, data);
    toastService.success('Caja cerrada exitosamente');
    return response;
  }

  async getCurrentCashRegister(): Promise<CashRegister | null> {
    try {
      const response = await api.get<CashRegister>('/cash-registers/current');
      return response;
    } catch (error) {
      console.error('Error getting current cash register:', error);
      
      // Manejar el error específico de "no open cash register"
      if (error instanceof Error) {
        if (error.message.includes('no open cash register') || 
            error.message.includes('There is no open cash register currently')) {
          return null;
        }
      }
      
      return null;
    }
  }

  async getCashRegisterBalance(id: string): Promise<CashRegisterBalance> {
    const response = await api.get<CashRegisterBalance>(`/cash-registers/${id}/balance`);
    return response;
  }

  // Cash Transaction operations
  async getCashTransactions(cashRegisterId: string, page?: number, limit?: number): Promise<PaginatedCashTransactionResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/cash-transactions/cash-registers/${cashRegisterId}/transactions${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await api.get<PaginatedCashTransactionResponse>(url);
      return response;
    } catch (error) {
      console.error('❌ API error:', error);
      throw error;
    }
  }

  async createCashTransaction(data: Record<string, unknown>): Promise<CashTransaction> {
    const response = await api.post<CashTransaction>('/cash-transactions', data);
    return response;
  }

  async getCashTransaction(id: string): Promise<CashTransaction> {
    const response = await api.get<CashTransaction>(`/cash-transactions/${id}`);
    return response;
  }

  // Cash Report operations
  async getCashReport(cashRegisterId: string, startDate: string, endDate: string): Promise<Record<string, unknown>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    const response = await api.get<Record<string, unknown>>(`/cash-transactions/cash-registers/${cashRegisterId}/report?${params.toString()}`);
    return response;
  }
}

export const cashRegisterService = new CashRegisterService(); 