'use client'

import { useTranslations } from 'next-intl';
import { Quotation, QuotationStatus } from '@/types/quotation';
import { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { EyeIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon, DocumentArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface QuotationActionsMenuProps {
  quotation: Quotation;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onGeneratePDF: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
  loadingActions: { [key: string]: boolean };
}

export function QuotationActionsMenu({
  quotation,
  onView,
  onEdit,
  onDelete,
  onConvert,
  onGeneratePDF,
  onSendEmail,
  loadingActions,
}: QuotationActionsMenuProps) {
  const t = useTranslations('pages.quotations');
  const tCommon = useTranslations('common');

  const canConvertToSale = () => {
    return quotation.status !== QuotationStatus.CONVERTED && 
           quotation.status !== QuotationStatus.REJECTED &&
           quotation.status !== QuotationStatus.EXPIRED;
  };

  const items: ActionMenuItem[] = [
    {
      icon: <EyeIcon className="h-4 w-4" />,
      label: t('actions.view'),
      onClick: () => onView(quotation),
    },
    {
      icon: <DocumentArrowDownIcon className="h-4 w-4" />,
      label: t('actions.downloadPDF'),
      onClick: () => onGeneratePDF(quotation),
      color: '#059669',
    },
    {
      icon: <EnvelopeIcon className="h-4 w-4" />,
      label: t('actions.sendByEmail'),
      onClick: () => onSendEmail(quotation),
      color: '#4f46e5',
    },
  ];

  if (quotation.status !== QuotationStatus.CONVERTED) {
    items.push({
      icon: <PencilIcon className="h-4 w-4" />,
      label: tCommon('actions.edit'),
      onClick: () => onEdit(quotation),
    });
  }

  if (canConvertToSale()) {
    items.push({
      icon: <ArrowsRightLeftIcon className="h-4 w-4" />,
      label: t('actions.convertToSale'),
      onClick: () => onConvert(quotation),
      color: '#059669',
    });
  }

  if (quotation.status !== QuotationStatus.CONVERTED) {
    items.push({
      icon: <TrashIcon className="h-4 w-4" />,
      label: tCommon('actions.delete'),
      onClick: () => onDelete(quotation),
      color: '#dc2626',
    });
  }

  return items;
}
