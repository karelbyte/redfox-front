'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/context/ThemeContext';
import { useLocaleUtils } from '@/hooks/useLocale';
import { analyticsService, DashboardAnalytics } from '@/services/analytics.service';
import Loading from '@/components/Loading/Loading';
import AnalyticsCard from '@/components/Analytics/AnalyticsCard';
import SalesChart from '@/components/Analytics/SalesChart';
import InventoryChart from '@/components/Analytics/InventoryChart';
import RevenueChart from '@/components/Analytics/RevenueChart';
import TopProductsChart from '@/components/Analytics/TopProductsChart';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const t = useTranslations('pages.dashboard');
  const { can } = usePermissions();
  const { currentTheme } = useTheme();
  const { formatCurrency } = useLocaleUtils();
  
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardAnalytics(
        dateRange.startDate,
        dateRange.endDate
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColors = () => {
    const colors = {
      red: {
        primary: 'rgb(255, 92, 92)',
        light: 'rgb(255, 245, 245)',
        dark: 'rgb(230, 26, 26)',
        veryLight: 'rgb(255, 250, 250)',
        border: 'rgb(255, 200, 200)'
      },
      blue: {
        primary: 'rgb(59, 130, 246)',
        light: 'rgb(239, 246, 255)',
        dark: 'rgb(29, 78, 216)',
        veryLight: 'rgb(248, 250, 252)',
        border: 'rgb(191, 219, 254)'
      },
      gray: {
        primary: 'rgb(107, 114, 128)',
        light: 'rgb(249, 250, 251)',
        dark: 'rgb(55, 65, 81)',
        veryLight: 'rgb(250, 250, 250)',
        border: 'rgb(209, 213, 219)'
      },
      'green-gray': {
        primary: 'rgb(107, 124, 107)',
        light: 'rgb(246, 248, 246)',
        dark: 'rgb(70, 84, 70)',
        veryLight: 'rgb(250, 251, 250)',
        border: 'rgb(200, 230, 201)'
      },
      brown: {
        primary: 'rgb(89, 52, 19)',
        light: 'rgb(250, 248, 246)',
        dark: 'rgb(59, 35, 13)',
        veryLight: 'rgb(252, 251, 250)',
        border: 'rgb(214, 211, 209)'
      }
    };
    return colors[currentTheme] || colors['green-gray'];
  };

  const themeColors = getThemeColors();

  if (loading) {
    return (
      <div className="h-full bg-white p-8">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="h-full bg-white p-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">{t('analytics.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full p-6"
      style={{ backgroundColor: themeColors.veryLight }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: themeColors.primary }}
              >
                {t('title')}
              </h1>
              <p className="text-gray-600 text-lg">{t('welcome')}, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => logout()}
                className="px-6 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white'
                }}
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {can(['analytics_module_view']) && (
            <>
              <AnalyticsCard
                title={t('analytics.totalSales')}
                value={analytics.sales.totalSales}
                subtitle={`${t('analytics.averageTicket')}: ${formatCurrency(analytics.sales.averageTicket)}`}
                trend={{
                  value: analytics.sales.salesGrowth,
                  isPositive: analytics.sales.salesGrowth >= 0
                }}
                themeColors={themeColors}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <AnalyticsCard
                title={t('analytics.totalRevenue')}
                value={formatCurrency(analytics.sales.totalRevenue)}
                themeColors={themeColors}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5" />
                  </svg>
                }
              />
              <AnalyticsCard
                title={t('analytics.totalProducts')}
                value={analytics.inventory.totalProducts}
                subtitle={`${analytics.inventory.lowStockProducts} ${t('analytics.lowStock')}`}
                themeColors={themeColors}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
              />
              <AnalyticsCard
                title={t('analytics.inventoryValue')}
                value={formatCurrency(analytics.inventory.totalInventoryValue)}
                subtitle={`${analytics.inventory.outOfStockProducts} ${t('analytics.outOfStock')}`}
                themeColors={themeColors}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend */}
          {can(['analytics_module_view']) && (
            <div 
              className="overflow-hidden"
              style={{
                backgroundColor: 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px'
              }}
            >
              <div 
                className="px-6 py-4"
                style={{ 
                  backgroundColor: themeColors.light,
                  borderBottom: `1px solid ${themeColors.border}`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                }}
              >
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {t('analytics.salesTrend')}
                </h3>
              </div>
              <div className="p-6">
                {analytics.sales.salesByDay.length > 0 ? (
                  <SalesChart 
                    data={analytics.sales.salesByDay}
                    type="daily"
                    themeColors={themeColors}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">{t('analytics.noSalesData')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inventory by Category */}
          {can(['analytics_module_view']) && (
            <div 
              className="overflow-hidden"
              style={{
                backgroundColor: 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px'
              }}
            >
              <div 
                className="px-6 py-4"
                style={{ 
                  backgroundColor: themeColors.light,
                  borderBottom: `1px solid ${themeColors.border}`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                }}
              >
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {t('analytics.inventoryByCategory')}
                </h3>
              </div>
              <div className="p-6">
                {analytics.inventory.productsByCategory.length > 0 ? (
                  <InventoryChart 
                    data={analytics.inventory.productsByCategory}
                    themeColors={themeColors}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-gray-500 text-sm">{t('analytics.noInventoryData')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Revenue and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue */}
          {can(['analytics_module_view']) && (
            <div 
              className="overflow-hidden"
              style={{
                backgroundColor: 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px'
              }}
            >
              <div 
                className="px-6 py-4"
                style={{ 
                  backgroundColor: themeColors.light,
                  borderBottom: `1px solid ${themeColors.border}`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                }}
              >
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {t('analytics.monthlyRevenue')}
                </h3>
              </div>
              <div className="p-6">
                {analytics.financial.monthlyRevenue.length > 0 ? (
                  <RevenueChart 
                    data={analytics.financial.monthlyRevenue}
                    themeColors={themeColors}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5" />
                      </svg>
                      <p className="text-gray-500 text-sm">{t('analytics.noRevenueData')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Products */}
          {can(['analytics_module_view']) && (
            <div 
              className="overflow-hidden"
              style={{
                backgroundColor: 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px'
              }}
            >
              <div 
                className="px-6 py-4"
                style={{ 
                  backgroundColor: themeColors.light,
                  borderBottom: `1px solid ${themeColors.border}`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                }}
              >
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {t('analytics.topProducts')}
                </h3>
              </div>
              <div className="p-6">
                {analytics.sales.topProducts.length > 0 ? (
                  <TopProductsChart 
                    data={analytics.sales.topProducts}
                    themeColors={themeColors}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-gray-500 text-sm">{t('analytics.noProductsData')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        {can(['analytics_module_view']) && analytics.inventory.lowStockItems.length > 0 && (
          <div 
            className="overflow-hidden"
            style={{
              backgroundColor: 'white',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px'
            }}
          >
            <div 
              className="px-6 py-4"
              style={{ 
                backgroundColor: themeColors.light,
                borderBottom: `1px solid ${themeColors.border}`,
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}
            >
              <h3 
                className="text-lg font-semibold"
                style={{ color: themeColors.primary }}
              >
                {t('analytics.lowStockAlert')}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.inventory.lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: themeColors.veryLight,
                      borderLeftColor: '#f59e0b'
                    }}
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{item.productName}</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {t('analytics.warehouse')}: {item.warehouseName}
                    </p>
                    <p className="text-sm font-medium text-orange-600">
                      {t('analytics.stock')}: {item.currentStock}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}