'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { warehousesService } from '@/services/warehouses.service';
import { cashRegisterService } from '@/services/cash-register.service';
import { userAttributionsService, UserAttribution } from '@/services/user-attributions.service';
import { usersService } from '@/services/users.service';
import { toastService } from '@/services/toast.service';
import { Warehouse } from '@/types/warehouse';
import { CashRegister } from '@/types/cash-register';
import { User } from '@/types/user';
import Btn from '@/components/atoms/Btn';

type TabType = 'WAREHOUSE' | 'CASH_REGISTER';

const translations = {
  es: {
    back: 'Volver',
    attributions: 'Atribuciones',
    warehouses: 'Almacenes',
    cashRegisters: 'Cajas',
    loading: 'Cargando...',
    saving: 'Guardando...',
    save: 'Guardar',
    errorLoading: 'Error al cargar datos',
    errorSaving: 'Error al guardar atribuciones',
    successSaved: 'Atribuciones guardadas exitosamente',
  },
  en: {
    back: 'Back',
    attributions: 'Attributions',
    warehouses: 'Warehouses',
    cashRegisters: 'Cash Registers',
    loading: 'Loading...',
    saving: 'Saving...',
    save: 'Save',
    errorLoading: 'Error loading data',
    errorSaving: 'Error saving attributions',
    successSaved: 'Attributions saved successfully',
  },
  zh: {
    back: '返回',
    attributions: '属性',
    warehouses: '仓库',
    cashRegisters: '收银机',
    loading: '加载中...',
    saving: '保存中...',
    save: '保存',
    errorLoading: '加载数据错误',
    errorSaving: '保存属性错误',
    successSaved: '属性保存成功',
  },
};

export default function UserAttributionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();

  const t = translations[locale as keyof typeof translations] || translations.es;

  const [activeTab, setActiveTab] = useState<TabType>('WAREHOUSE');
  const [user, setUser] = useState<User | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [attributions, setAttributions] = useState<UserAttribution[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<string[]>([]);
  const [selectedCashRegisterIds, setSelectedCashRegisterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, warehousesData, cashRegistersData, warehouseAttributionsData, cashRegisterAttributionsData] = await Promise.all([
        usersService.getUser(params.id as string),
        warehousesService.getWarehouses({}),
        cashRegisterService.getCashRegisters(1, 100),
        userAttributionsService.getUserAttributions(
          params.id as string,
          'WAREHOUSE',
        ),
        userAttributionsService.getUserAttributions(
          params.id as string,
          'CASH_REGISTER',
        ),
      ]);
      setUser(userData);
      setWarehouses(warehousesData.data);
      setCashRegisters(cashRegistersData.data);
      setAttributions(warehouseAttributionsData);
      setSelectedWarehouseIds(
        warehouseAttributionsData.map((a) => a.resourceId),
      );
      setSelectedCashRegisterIds(
        cashRegisterAttributionsData.map((a) => a.resourceId),
      );
    } catch (error) {
      console.error('Error loading data:', error);
      toastService.error(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseToggle = (warehouseId: string) => {
    setSelectedWarehouseIds((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId],
    );
  };

  const handleCashRegisterToggle = (cashRegisterId: string) => {
    setSelectedCashRegisterIds((prev) =>
      prev.includes(cashRegisterId)
        ? prev.filter((id) => id !== cashRegisterId)
        : [...prev, cashRegisterId],
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (activeTab === 'WAREHOUSE') {
        await userAttributionsService.assignAttributions({
          userId: params.id as string,
          attributionType: 'WAREHOUSE',
          resourceIds: selectedWarehouseIds,
          resourceType: 'warehouse',
        });
      } else if (activeTab === 'CASH_REGISTER') {
        await userAttributionsService.assignAttributions({
          userId: params.id as string,
          attributionType: 'CASH_REGISTER',
          resourceIds: selectedCashRegisterIds,
          resourceType: 'cash_register',
        });
      }
      toastService.success(t.successSaved);
      await loadData();
    } catch (error) {
      console.error('Error saving attributions:', error);
      toastService.error(t.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'WAREHOUSE' as TabType, label: t.warehouses },
    { id: 'CASH_REGISTER' as TabType, label: t.cashRegisters },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Btn
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard/configuracion/usuarios`)}
                leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
              >
                {t.back}
              </Btn>
              <div>
                <h1 className="text-xl font-semibold text-primary-800">
                  {t.attributions} - {user?.name}
                </h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'WAREHOUSE' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t.loading}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {warehouses.map((warehouse) => (
                      <label
                        key={warehouse.id}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWarehouseIds.includes(warehouse.id)}
                          onChange={() => handleWarehouseToggle(warehouse.id)}
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {warehouse.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                warehouse.is_open
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {warehouse.is_open ? 'Abierto' : 'Cerrado'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{warehouse.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Btn
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? t.saving : t.save}
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'CASH_REGISTER' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t.loading}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cashRegisters.map((cashRegister) => (
                      <label
                        key={cashRegister.id}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCashRegisterIds.includes(cashRegister.id)}
                          onChange={() => handleCashRegisterToggle(cashRegister.id)}
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {cashRegister.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                cashRegister.status === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {cashRegister.status === 'open' ? 'Abierta' : 'Cerrada'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{cashRegister.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Btn
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? t.saving : t.save}
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
