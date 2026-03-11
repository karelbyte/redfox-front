'use client'

import { useTranslations } from 'next-intl';
import { Sale, SaleStatus } from '@/types/sale';
import { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, DocumentTextIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface SaleActionsMenuProps {
  sale: Sale;
  onDetails: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onClose: (sale: Sale) => void;
  onRefund: (sale: Sale) => void;
  onPrintTicket: (sale: Sale) => void;
  onInvoice?: (sale: Sale) => void;
}

export function SaleActionsMenu({
  sale,
  onDetails,
  onEdit,
  onDelete,
  onClose,
  onRefund,
  onPrintTicket,
  onInvoice,
}: SaleActionsMenuProps) {
  const t = useTranslations('pages.sales');
  const tCommon = useTranslations('common');

  const items: ActionMenuItem[] = [
    {
      icon: <EyeIcon className="h-4 w-4" />,
      label: t('actions.viewDetails'),
      onClick: () => onDetails(sale),
    },
    {
      icon: <DocumentTextIcon className="h-4 w-4" />,
      label: t('actions.printTicket'),
      onClick: () => onPrintTicket(sale),
    },
  ];

  if (sale.status === SaleStatus.CLOSED && onInvoice) {
    items.push({
      icon: <DocumentTextIcon className="h-4 w-4" />,
      label: t('actions.invoice'),
      color: '#059669',
      onClick: () => onInvoice(sale),
    });
  }

  if (sale.status === SaleStatus.OPEN) {
    items.push({
      icon: <CheckCircleIcon className="h-4 w-4" />,
      label: t('actions.closeSale'),
      color: '#059669',
      onClick: () => onClose(sale),
    });
  }

  if (sale.status === SaleStatus.CLOSED) {
    const canRefund = !sale.pack_fiscal_status || (sale.pack_fiscal_status !== 'INVOICED_DIRECT' && !sale.cfdi_uuid);
    items.push({
      icon: <ArrowUturnLeftIcon className="h-4 w-4" />,
      label: t('actions.refund'),
      color: canRefund ? '#dc2626' : '#9ca3af',
      onClick: () => onRefund(sale),
    });
  }

  if (sale.status === SaleStatus.OPEN) {
    items.push({
      icon: <PencilIcon className="h-4 w-4" />,
      label: tCommon('actions.edit'),
      onClick: () => onEdit(sale),
    });
  }

  if (sale.status === SaleStatus.OPEN) {
    items.push({
      icon: <TrashIcon className="h-4 w-4" />,
      label: tCommon('actions.delete'),
      color: '#dc2626',
      onClick: () => onDelete(sale),
    });
  }

  return items;
}
