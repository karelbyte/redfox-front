"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CashFlowSummary as CashFlowSummaryType, CashFlowMovement, CashFlowProjection as CashFlowProjectionType } from '@/types/cash-flow';
import { cashFlowService } from '@/services/cash-flow.service';
import { toastService } from '@/services/toast.service';
import CashFlowSummary from './CashFlowSummary';
import CashFlowTable from './CashFlowTable';
import CashFlowProjection from './CashFlowProjection';
import CashFlowChart from './CashFlowChart';
import CashFlowAdvancedCharts from './CashFlowAdvancedCharts';
import CashFlowAlert from './CashFlowAlert';
import CashFlowTrends from './CashFlowTrends';
import CashFlowComparison from './CashFlowComparison';
import CashFlowExport from './CashFlowExport';
import CashFlowEmailAlert from './CashFlowEmailAlert';
import CashFlowPrediction from './CashFlowPrediction';
import CashFlowYearComparison from './CashFlowYearComparison';
import { Input } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';

export default function CashFlowDashboard() {
  const t = useTranslations('cashFlow');
  const [summary, setSummary] = useState<CashFlowSummaryType | null>(null);
  const [movements, setMovements] = useState<CashFlowMovement[]>([]);
  const [projections, setProjections] = useState<CashFlowProjectionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, movementsData, projectionsData] = await Promise.all([
        cashFlowService.getSummary(startDate || undefined, endDate || undefined),
        cashFlowService.getMovements(startDate || undefined, endDate || undefined),
        cashFlowService.getProjection(3),
      ]);

      setSummary(summaryData);
      setMovements(movementsData);
      setProjections(projectionsData);
    } catch (error) {
      console.error('Error loading cash flow data:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = () => {
    loadData();
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                type="date"
                id="startDate"
                label={t('filters.startDate')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                id="endDate"
                label={t('filters.endDate')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={handleDateChange}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('filters.apply')}
              </button>
              <button
                onClick={handleClearDates}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('filters.clear')}
              </button>
            </div>
          </div>
          {summary && movements.length > 0 && (
            <CashFlowExport summary={summary} movements={movements} isLoading={isLoading} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          {summary && (
            <>
              <CashFlowAlert netCashFlow={summary.netCashFlow} projectedBalance={summary.projectedBalance} />

              <CashFlowSummary data={summary} />

              <CashFlowChart movements={movements} />

              <CashFlowAdvancedCharts movements={movements} />

              <CashFlowTrends movements={movements} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CashFlowTable movements={movements} />
                </div>
                <div>
                  <CashFlowProjection projections={projections} />
                </div>
              </div>

              <CashFlowComparison currentSummary={summary} />

              <CashFlowPrediction movements={movements} />

              <CashFlowYearComparison currentSummary={summary} />

              <CashFlowEmailAlert summary={summary} />
            </>
          )}
        </>
      )}
    </div>
  );
}
