'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/context/ThemeContext';
import { saleService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { warehousesService } from '@/services/warehouses.service';
import { productService } from '@/services/products.service';
import { receptionService } from '@/services/receptions.service';
import Loading from '@/components/Loading/Loading';
import { Sale } from '@/types/sale';
import { Reception } from '@/types/reception';
import { Warehouse } from '@/types/warehouse';
import { InventoryProduct } from '@/services/inventory.service';

interface DashboardStats {
  totalSales: number;
  totalSalesToday: number;
  totalProducts: number;
  totalWarehouses: number;
  activeWarehouses: number;
  lowStockProducts: number;
  pendingReceptions: number;
  totalRevenue: number;
  revenueToday: number;
}

interface WarehouseSummary {
  id: string;
  name: string;
  status: boolean;
  totalProducts: number;
  lowStockCount: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const t = useTranslations('pages.dashboard');
  const { can } = usePermissions();
  const { currentTheme } = useTheme();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalSalesToday: 0,
    totalProducts: 0,
    totalWarehouses: 0,
    activeWarehouses: 0,
    lowStockProducts: 0,
    pendingReceptions: 0,
    totalRevenue: 0,
    revenueToday: 0,
  });
  
  const [warehouseSummaries, setWarehouseSummaries] = useState<WarehouseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        salesData,
        warehousesData,
        productsData,
        receptionsData,
        inventoryData
      ] = await Promise.all([
        can(['sale_module_view']) ? saleService.getSales() : Promise.resolve({ data: [], meta: { total: 0 } }),
        can(['warehouse_module_view']) ? warehousesService.getWarehouses({}) : Promise.resolve({ data: [], meta: { total: 0 } }),
        can(['product_module_view']) ? productService.getProducts() : Promise.resolve({ data: [], meta: { total: 0 } }),
        can(['reception_module_view']) ? receptionService.getReceptions() : Promise.resolve({ data: [], meta: { total: 0 } }),
        can(['inventory_module_view']) ? inventoryService.getInventoryProducts(1) : Promise.resolve({ data: [], meta: { total: 0 } })
      ]);

      const today = new Date().toISOString().split('T')[0];
      const salesToday = salesData.data.filter((sale: Sale) => 
        sale.created_at?.startsWith(today)
      );
      
      const totalRevenue = salesData.data.reduce((sum: number, sale: Sale) => 
        sum + parseFloat(sale.amount || '0'), 0
      );
      
      const revenueToday = salesToday.reduce((sum: number, sale: Sale) => 
        sum + parseFloat(sale.amount || '0'), 0
      );

      const activeWarehouses = warehousesData.data.filter((w: Warehouse) => w.status);
      const pendingReceptions = receptionsData.data.filter((r: Reception) => !r.status);
      const lowStockProducts = inventoryData.data.filter((item: InventoryProduct) => 
        item.quantity < 10
      ).length;

      setStats({
        totalSales: salesData.meta.total,
        totalSalesToday: salesToday.length,
        totalProducts: productsData.meta.total,
        totalWarehouses: warehousesData.meta.total,
        activeWarehouses: activeWarehouses.length,
        lowStockProducts,
        pendingReceptions: pendingReceptions.length,
        totalRevenue,
        revenueToday,
      });

      const warehouseSummariesData = warehousesData.data.map((warehouse: Warehouse) => ({
        id: warehouse.id,
        name: warehouse.name,
        status: warehouse.status,
        totalProducts: inventoryData.data.filter((item: InventoryProduct) => 
          item.warehouse.id === warehouse.id
        ).length,
        lowStockCount: inventoryData.data.filter((item: InventoryProduct) => 
          item.warehouse.id === warehouse.id && item.quantity < 10
        ).length,
      }));

      setWarehouseSummaries(warehouseSummariesData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const StatCard = ({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
  }) => (
    <div 
      className="p-6 rounded-lg"
      style={{
        backgroundColor: themeColors.veryLight,
        border: `1px solid ${themeColors.border}`
      }}
    >
      <div className="flex items-center">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
          style={{
            backgroundColor: themeColors.light,
            color: themeColors.primary
          }}
        >
          <div className="w-6 h-6">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full bg-white p-8">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
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

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {can(['sale_module_view']) && (
            <>
              <StatCard
                title={t('stats.totalSales')}
                value={stats.totalSales}
                subtitle={`${stats.totalSalesToday} ${t('stats.salesToday')}`}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatCard
                title={t('stats.totalRevenue')}
                value={`$${stats.totalRevenue.toLocaleString()}`}
                subtitle={`$${stats.revenueToday.toLocaleString()} ${t('stats.revenueToday')}`}
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-2.599-3.801C9.08 13.598 8 13.198 8 12.5v-.5" />
                  </svg>
                }
              />
            </>
          )}
          
          {can(['warehouse_module_view']) && (
            <StatCard
              title={t('stats.activeWarehouses')}
              value={`${stats.activeWarehouses}/${stats.totalWarehouses}`}
              subtitle={t('stats.operationalWarehouses')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
            />
          )}
          
          {can(['product_module_view']) && (
            <StatCard
              title={t('stats.products')}
              value={stats.totalProducts}
              subtitle={`${stats.lowStockProducts} ${t('stats.lowStock')}`}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
          )}
          
          {can(['reception_module_view']) && (
            <StatCard
              title={t('stats.pendingReceptions')}
              value={stats.pendingReceptions}
              subtitle={t('stats.toProcess')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          )}
        </div>

        {/* Información de Almacenes */}
        {can(['warehouse_module_view']) && warehouseSummaries.length > 0 && (
          <div 
            className="mb-8 overflow-hidden"
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
              <h2 
                className="text-lg font-semibold"
                style={{ color: themeColors.primary }}
              >
                {t('warehouses.status')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouseSummaries.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: themeColors.veryLight,
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                      <span
                        className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: themeColors.light,
                          color: themeColors.primary
                        }}
                      >
                        {warehouse.status ? t('warehouses.active') : t('warehouses.inactive')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <span 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: themeColors.primary }}
                        ></span>
                        {t('warehouses.products')}: <span className="font-semibold ml-1">{warehouse.totalProducts}</span>
                      </p>
                      <p className="flex items-center">
                        <span 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: themeColors.dark }}
                        ></span>
                        {t('warehouses.lowStock')}: <span className="font-semibold ml-1">{warehouse.lowStockCount}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Información del Usuario */}
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
            <h2 
              className="text-lg font-semibold"
              style={{ color: themeColors.primary }}
            >
              {t('userInfo')}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.veryLight }}>
                <label className="block text-sm font-medium text-gray-500 mb-2">{t('userName')}</label>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.veryLight }}>
                <label className="block text-sm font-medium text-gray-500 mb-2">{t('userEmail')}</label>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: themeColors.veryLight }}>
                <label className="block text-sm font-medium text-gray-500 mb-2">{t('userRole')}</label>
                <p className="text-lg font-semibold text-gray-900">{user?.roles[0]?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 