'use client'

import { useTranslations } from 'next-intl';
import { PurchaseOrder } from '@/types/purchase-order';
import { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface PurchaseOrderActionsMenuProps {
  purchaseOrder: PurchaseOrder;
  onDetails: (purchaseOrder: PurchaseOrder) => void;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrder: PurchaseOrder) => void;
  onApprove: (purchaseOrder: PurchaseOrder) => void;
  onReject: (purchaseOrder: PurchaseOrder) => void;
  onCancel: (purchaseOrder: PurchaseOrder) => void;
  onGeneratePDF: (purchaseOrder: PurchaseOrder) => void;
}

export function PurchaseOrderActionsMenu({
  purchaseOrder,
  onDetails,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onCancel,
  onGeneratePDF,
}: PurchaseOrderActionsMenuProps) {
  const t = useTranslations('pages.purchaseOrders');
  const tCommon = useTranslations('common');

  const canEdit = purchaseOrder.status === 'PENDING';
  const canDelete = purchaseOrder.status === 'PENDING';
  const canApprove = purchaseOrder.status === 'PENDING';
  const canReject = purchaseOrder.status === 'PENDING';
  const canCancel = purchaseOrder.status === 'PENDING' || purchaseOrder.status === 'APPROVED';

  const items: ActionMenuItem[] = [
    {
      icon: <EyeIcon className="h-4 w-4" />,
      label: t('actions.viewDetails'),
      onClick: () => onDetails(purchaseOrder),
    },
    {
      icon: <DocumentArrowDownIcon className="h-4 w-4" />,
      label: t('actions.generatePDF'),
      color: '#059669',
      onClick: () => onGeneratePDF(purchaseOrder),
    },
  ];

  if (canApprove) {
    items.push({
      icon: <CheckCircleIcon className="h-4 w-4" />,
      label: t('actions.approve'),
      color: '#059669',
      onClick: () => onApprove(purchaseOrder),
    });
  }

  if (canReject) {
    items.push({
      icon: <XCircleIcon className="h-4 w-4" />,
      label: t('actions.reject'),
      color: '#dc2626',
      onClick: () => onReject(purchaseOrder),
    });
  }

  if (canCancel) {
    items.push({
      icon: <XMarkIcon className="h-4 w-4" />,
      label: t('actions.cancel'),
      color: '#f59e0b',
      onClick: () => onCancel(purchaseOrder),
    });
  }

  if (canEdit) {
    items.push({
      icon: <PencilIcon className="h-4 w-4" />,
      label: tCommon('actions.edit'),
      onClick: () => onEdit(purchaseOrder),
    });
  }

  if (canDelete) {
    items.push({
      icon: <TrashIcon className="h-4 w-4" />,
      label: tCommon('actions.delete'),
      color: '#dc2626',
      onClick: () => onDelete(purchaseOrder),
    });
  }

  return items;
}
