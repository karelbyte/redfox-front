'use client'

import { useTranslations } from 'next-intl';
import { Invoice } from '@/types/invoice';
import { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { InvoicePDFButton, InvoiceXMLButton } from './InvoiceDownloadButtons';
import { FileCheck2 } from 'lucide-react';

interface InvoiceActionsMenuProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onDetails: (invoice: Invoice) => void;
  onGenerateCFDI: (invoice: Invoice) => void;
  onCancelCFDI: (invoice: Invoice) => void;
}

export function InvoiceActionsMenu({
  invoice,
  onEdit,
  onDelete,
  onDetails,
  onGenerateCFDI,
  onCancelCFDI,
}: InvoiceActionsMenuProps) {
  const t = useTranslations('pages.invoices');
  const tCommon = useTranslations('common');

  const canEdit = invoice.status === 'DRAFT';
  const canDelete = invoice.status === 'DRAFT';
  const canGenerateCFDI = invoice.status === 'DRAFT' || invoice.status === 'FAILED_CFDI';
  const canCancelCFDI = invoice.status === 'SENT' || invoice.status === 'PAID';
  const canDownload = invoice.status === 'SENT' || invoice.status === 'PAID' || invoice.status === 'CANCELLED';

  const items: ActionMenuItem[] = [
    {
      icon: <EyeIcon className="h-4 w-4" />,
      label: t('actions.viewDetails'),
      onClick: () => onDetails(invoice),
    },
  ];

  if (canGenerateCFDI) {
    items.push({
      icon: <FileCheck2 className="h-4 w-4" />,
      label: t('actions.generateCFDI'),
      color: '#059669',
      onClick: () => onGenerateCFDI(invoice),
    });
  }

  if (canCancelCFDI) {
    items.push({
      icon: <XMarkIcon className="h-4 w-4" />,
      label: t('actions.cancelCFDI'),
      color: '#dc2626',
      onClick: () => onCancelCFDI(invoice),
    });
  }

  if (canEdit) {
    items.push({
      icon: <PencilIcon className="h-4 w-4" />,
      label: tCommon('actions.edit'),
      onClick: () => onEdit(invoice),
    });
  }

  if (canDelete) {
    items.push({
      icon: <TrashIcon className="h-4 w-4" />,
      label: tCommon('actions.delete'),
      color: '#dc2626',
      onClick: () => onDelete(invoice),
    });
  }

  return items;
}
