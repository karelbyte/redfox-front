'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { warehousesService } from '@/services/warehouses.service';
import { Warehouse } from '@/types/warehouse';
import { Select, Btn } from '@/components/atoms';
import Loading from '@/components/Loading/Loading';

interface ConvertToSaleModalProps {
  isOpen: boolean;
  quotationCode: string;
  onClose: () => void;
  onConfirm: (warehouseId: string) => void;
  isLoading?: boolean;
}

const ConvertToSaleModal = ({
  isOpen,
  quotationCode,
  onClose,
  onConfirm,
  isLoading = false,
}: ConvertToSaleModalProps) => {
  const t = useTranslations('pages.quotations');
  const tCommon = useTranslations('common');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedWarehouseId('');
      setError('');
      loadWarehouses();
    }
  }, [isOpen]);

  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehousesService.getWarehouses({ isClosed: true });
      setWarehouses(response.data || []);
    } catch (err) {
      console.error('Error loading warehouses:', err);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedWarehouseId) {
      setError(t('form.errors.warehouseRequired'));
      return;
    }
    onConfirm(selectedWarehouseId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          {/* Icono */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
            {t('actions.convertToSale')}
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            {t('messages.confirmConvertToSale', { code: quotationCode })}
          </p>

          {/* Selector de almacén */}
          {loadingWarehouses ? (
            <div className="flex justify-center py-4">
              <Loading size="sm" />
            </div>
          ) : (
            <div className="mb-6">
              <Select
                id="warehouse"
                label={t('form.warehouse')}
                value={selectedWarehouseId}
                onChange={(e) => {
                  setSelectedWarehouseId(e.target.value);
                  setError('');
                }}
                options={warehouses.map((w) => ({
                  value: w.id,
                  label: `${w.code} - ${w.name}`,
                }))}
                placeholder={t('form.placeholders.selectWarehouse')}
                required
                error={error}
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('messages.warehouseForSaleHint')}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <Btn
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              fullWidth
            >
              {tCommon('actions.cancel')}
            </Btn>
            <Btn
              variant="success"
              onClick={handleConfirm}
              loading={isLoading}
              disabled={loadingWarehouses || !selectedWarehouseId}
              fullWidth
            >
              {t('actions.convertToSale')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertToSaleModal;
