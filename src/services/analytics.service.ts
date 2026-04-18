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

export interface ExtendedAnalytics {
  salesByPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
  salesByDayOfWeek: Array<{ day: string; sales: number; revenue: number }>;
  salesByUser: Array<{ userId: string; userName: string; sales: number; revenue: number }>;
  inventoryByWarehouse: Array<{ warehouseId: string; warehouseName: string; value: number; products: number }>;
  slowMovingProducts: Array<{ productId: string; productName: string; lastMovement: string | null; stock: number }>;
  receivablesAging: Array<{ bucket: string; count: number; amount: number }>;
  expensesByCategory: Array<{ categoryId: string; categoryName: string; amount: number; count: number }>;
  incomeVsExpenses: Array<{ month: string; income: number; expenses: number }>;
  topClients: Array<{ clientId: string; clientName: string; totalPurchases: number; totalSpent: number }>;
  shipmentsByStatus: Array<{ status: string; count: number }>;
  avgDeliveryTimeByCarrier: Array<{ carrier: string; avgDays: number; shipments: number }>;
}

export interface SalesForecastingData {
  historicalSales: Array<{ month: string; sales: number; revenue: number }>;
  forecast: Array<{ month: string; predictedSales: number; confidence: number }>;
}

export interface ProductProfitabilityData {
  products: Array<{
    productName: string;
    unitsSold: number;
    profitMargin: number;
    totalRevenue: number;
  }>;
}

export interface MonthOverMonthComparisonData {
  sales: Array<{ month: string; value: number; growth: number }>;
  revenue: Array<{ month: string; value: number; growth: number }>;
  orders: Array<{ month: string; value: number; growth: number }>;
  customers: Array<{ month: string; value: number; growth: number }>;
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

  async getExtendedAnalytics(): Promise<ExtendedAnalytics> {
    return await api.get<ExtendedAnalytics>('/analytics/extended');
  }

  async getDashboardAnalytics(startDate?: string, endDate?: string): Promise<DashboardAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/analytics/dashboard${queryString ? `?${queryString}` : ''}`;
    
    return await api.get<DashboardAnalytics>(url);
  }

  async getSalesForecasting(): Promise<SalesForecastingData> {
    return await api.get<SalesForecastingData>('/analytics/sales-forecasting');
  }

  async getProductProfitability(): Promise<ProductProfitabilityData> {
    return await api.get<ProductProfitabilityData>('/analytics/product-profitability');
  }

  async getMonthOverMonthComparison(): Promise<MonthOverMonthComparisonData> {
    return await api.get<MonthOverMonthComparisonData>('/analytics/month-over-month');
  }
}

export const analyticsService = new AnalyticsService();