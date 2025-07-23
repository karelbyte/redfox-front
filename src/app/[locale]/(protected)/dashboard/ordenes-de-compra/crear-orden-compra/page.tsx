'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PurchaseOrder, PurchaseOrderFormData } from '@/types/purchase-order';
import { purchaseOrdersService } from '@/services';
import { toastService } from '@/services';
import PurchaseOrderForm from '@/components/PurchaseOrder/PurchaseOrderForm';
import Drawer from '@/components/Drawer/Drawer';
import { PurchaseOrderFormRef } from '@/components/PurchaseOrder/PurchaseOrderForm';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.purchaseOrders');
  const { can } = usePermissions();
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<PurchaseOrderFormRef>(null);

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    router.push(`/${locale}/dashboard/ordenes-de-compra`);
  };

  const handleSave = async () => {
    if (formRef.current) {
      const formData = await formRef.current.submit();
      if (formData) {
        try {
          setIsSaving(true);
          await purchaseOrdersService.createPurchaseOrder(formData);
          toastService.success(t('messages.purchaseOrderCreated'));
          handleFormSuccess();
        } catch (error) {
          if (error instanceof Error) {
            toastService.error(error.message);
          } else {
            toastService.error(t('messages.errorCreating'));
          }
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  if (!can(["purchase_order_create"])) {
    return <div>{t('noPermissionDesc')}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/ordenes-de-compra`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('actions.back')}
          </Btn>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('actions.create')}
            </h1>
            <p className="text-sm text-gray-600">{t('form.subtitle')}</p>
          </div>
        </div>
        <Btn
          onClick={() => setShowDrawer(true)}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          {t('actions.create')}
        </Btn>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('form.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('form.description')}</p>
            <div className="mt-6">
              <Btn
                onClick={() => setShowDrawer(true)}
                className="px-4"
              >
                {t('actions.create')}
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer para crear orden de compra */}
      <Drawer
        id="create-purchase-order-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={t('actions.create')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <PurchaseOrderForm
          ref={formRef}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>
    </div>
  );
} 