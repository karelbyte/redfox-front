'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { WarehouseAdjustment } from '@/types/warehouse-adjustment';
import Pagination from '@/components/Pagination/Pagination';
import { DeleteWarehouseAdjustmentModal } from './DeleteWarehouseAdjustmentModal';
import { CloseWarehouseAdjustmentModal } from './CloseWarehouseAdjustmentModal';
import { Btn } from '@/components/atoms';
import { EyeIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface WarehouseAdjustmentTableProps {
  adjustments: WarehouseAdjustment[];
  onDelete: (adjustmentId: string) => void;
  onClose: (adjustmentId: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function WarehouseAdjustmentTable({
  adjustments,
  onDelete,
  onClose,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: WarehouseAdjustmentTableProps) {
  const t = useTranslations('pages.warehouseAdjustments');
  const router = useRouter();
  const locale = useLocale();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<WarehouseAdjustment | null>(null);

  const handleDeleteClick = (adjustment: WarehouseAdjustment) => {
    setSelectedAdjustment(adjustment);
    setDeleteModalOpen(true);
  };

  const handleCloseClick = (adjustment: WarehouseAdjustment) => {
    setSelectedAdjustment(adjustment);
    setCloseModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAdjustment) {
      onDelete(selectedAdjustment.id);
      setDeleteModalOpen(false);
      setSelectedAdjustment(null);
    }
  };

  const handleCloseConfirm = () => {
    if (selectedAdjustment) {
      onClose(selectedAdjustment.id);
      setCloseModalOpen(false);
      setSelectedAdjustment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('status.closed')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {t('status.open')}
      </span>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.code')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.sourceWarehouse')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.targetWarehouse')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.description')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adjustments.map((adjustment) => (
              <tr key={adjustment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {adjustment.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{adjustment.sourceWarehouse.name}</div>
                    <div className="text-gray-500">{adjustment.sourceWarehouse.code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{adjustment.targetWarehouse.name}</div>
                    <div className="text-gray-500">{adjustment.targetWarehouse.code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(adjustment.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={adjustment.description}>
                    {adjustment.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(adjustment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Btn
                      onClick={() => router.push(`/${locale}/dashboard/almacenes/ajustes-de-almacen/ajustes/${adjustment.id}`)}
                      variant="primary"
                      size="sm"
                      leftIcon={<EyeIcon className="w-4 h-4" />}
                    >
                      {t('actions.viewDetails')}
                    </Btn>
                    
                    {!adjustment.status && (
                      <>
                        <Btn
                          onClick={() => handleCloseClick(adjustment)}
                          variant="success"
                          size="sm"
                          leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                        >
                          {t('actions.close')}
                        </Btn>
                        
                        <Btn
                          onClick={() => handleDeleteClick(adjustment)}
                          variant="danger"
                          size="sm"
                          leftIcon={<TrashIcon className="w-4 h-4" />}
                        >
                          {t('actions.delete')}
                        </Btn>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Delete Modal */}
      {selectedAdjustment && (
        <DeleteWarehouseAdjustmentModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedAdjustment(null);
          }}
          onConfirm={handleDeleteConfirm}
          adjustment={selectedAdjustment}
        />
      )}

      {/* Close Modal */}
      {selectedAdjustment && (
        <CloseWarehouseAdjustmentModal
          isOpen={closeModalOpen}
          onClose={() => {
            setCloseModalOpen(false);
            setSelectedAdjustment(null);
          }}
          onConfirm={handleCloseConfirm}
          adjustment={selectedAdjustment}
        />
      )}
    </>
  );
} 