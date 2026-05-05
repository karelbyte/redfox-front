"use client";

import { useState } from "react";
import { usePayrollTranslations } from "./PayrollTranslations.i18n";
import { useLocale } from "next-intl";
import { payrollService } from "@/services/payroll.service";
import { Payroll } from "@/types/employee";
import { toastService } from "@/services/toast.service";
import { Btn } from "@/components/atoms";

interface DeletePayrollModalProps {
  payroll: Payroll | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeletePayrollModal({
  payroll,
  onClose,
  onSuccess,
}: DeletePayrollModalProps) {
  const locale = useLocale();
  const t = usePayrollTranslations(locale);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!payroll) return;

    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await payrollService.deletePayroll(payroll.id);
      toastService.success(t('messages.deleteSuccess'));
      onSuccess();
    } catch (error: any) {
      const msg = error?.message || t('messages.errorSaving');
      setErrorMsg(msg);
      toastService.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!payroll) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div 
              className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              style={{ backgroundColor: `rgb(var(--color-primary-100))` }}
            >
              <svg
                className="h-6 w-6"
                style={{ color: `rgb(var(--color-primary-600))` }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {t('delete')}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t('messages.confirmDelete')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4">
            {errorMsg && (
              <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <div className="flex flex-row-reverse gap-2">
              <Btn
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                loading={isDeleting}
                className="inline-flex w-full justify-center text-sm shadow-sm sm:w-auto"
              >
                {t('delete')}
              </Btn>
              <Btn
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="inline-flex w-full justify-center text-sm sm:w-auto"
              >
                {t('cancel')}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
