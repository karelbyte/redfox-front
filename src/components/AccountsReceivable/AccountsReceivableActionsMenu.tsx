'use client'

import { useTranslations } from 'next-intl';
import { AccountReceivable, AccountReceivableStatus } from '@/types/account-receivable';
import { ActionMenuItem } from '@/components/atoms/ActionsMenu';
import { PencilIcon, TrashIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';

interface AccountsReceivableActionsMenuProps {
  account: AccountReceivable;
  onEdit: (account: AccountReceivable) => void;
  onDelete: (account: AccountReceivable) => void;
  onRegisterPayment: (account: AccountReceivable) => void;
  onViewPayments: (account: AccountReceivable) => void;
}

export function AccountsReceivableActionsMenu({
  account,
  onEdit,
  onDelete,
  onRegisterPayment,
  onViewPayments,
}: AccountsReceivableActionsMenuProps) {
  const t = useTranslations('accountsReceivable');
  const tCommon = useTranslations('common');
  const { can } = usePermissions();

  const items: ActionMenuItem[] = [
    {
      icon: <ClockIcon className="h-4 w-4" />,
      label: t('actions.viewPayments'),
      onClick: () => onViewPayments(account),
    },
  ];

  if (account.status !== AccountReceivableStatus.PAID && account.status !== AccountReceivableStatus.CANCELLED && can(["account_receivable_update"])) {
    items.push({
      icon: <CreditCardIcon className="h-4 w-4" />,
      label: t('actions.registerPayment'),
      color: '#059669',
      onClick: () => onRegisterPayment(account),
    });
  }

  if (can(["account_receivable_update"])) {
    items.push({
      icon: <PencilIcon className="h-4 w-4" />,
      label: tCommon('actions.edit'),
      onClick: () => onEdit(account),
    });
  }

  if (can(["account_receivable_delete"]) && Number(account.paidAmount) === 0) {
    items.push({
      icon: <TrashIcon className="h-4 w-4" />,
      label: tCommon('actions.delete'),
      color: '#dc2626',
      onClick: () => onDelete(account),
    });
  }

  return items;
}
