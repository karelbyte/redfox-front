import { api } from './api';

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesGrowth: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalPurchases: number;
    totalSpent: number;
  }>;
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  productsByCategory: Array<{
    categoryName: string;
    count: number;
    value: number;
  }>;
  lowStockItems: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    warehouseName: string;
  }>;
}

export interface FinancialAnalytics {
  totalInvoices: number;
  totalInvoiced: number;
  pendingInvoices: number;
  paidInvoices: number;
  invoicesByStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    invoiced: number;
    collected: number;
  }>;
}

export interface OperationalAnalytics {
  pendingReceptions: number;
  completedReceptions: number;
  averageReceptionTime: number;
  receptionsByMonth: Array<{
    month: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface DashboardAnalytics {
  sales: SalesAnalytics;
  inventory: InventoryAnalytics;
  financial: FinancialAnalytics;
  operational: OperationalAnalytics;
}

class AnalyticsService {
  async getSalesAnalytics(startDate?: string, endDate?: string): Promise<SalesAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/analytics/sales${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<SalesAnalytics>(url);
  }

  async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    return await api.get<InventoryAnalytics>('/analytics/inventory');
  }

  async getFinancialAnalytics(startDate?: string, endDate?: string): Promise<FinancialAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/analytics/financial${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<FinancialAnalytics>(url);
  }

  async getOperationalAnalytics(): Promise<OperationalAnalytics> {
    return await api.get<OperationalAnalytics>('/analytics/operational');
  }

  async getDashboardAnalytics(startDate?: string, endDate?: string): Promise<DashboardAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/analytics/dashboard${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<DashboardAnalytics>(url);
  }
}

export const analyticsService = new AnalyticsService();