'use client'

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toastService } from '@/services/toast.service';
import QuotationForm, { QuotationFormRef } from '@/components/Quotation/QuotationForm';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CreateQuotationPage = () => {
  const t = useTranslations('pages.quotations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const quotationFormRef = useRef<QuotationFormRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleBack = () => {
    router.push('/dashboard/cotizaciones/lista-de-cotizaciones');
  };

  const handleFormSuccess = () => {
    toastService.success(t('messages.createSuccess'));
    router.push('/dashboard/cotizaciones/lista-de-cotizaciones');
  };

  const handleSave = () => {
    if (quotationFormRef.current) {
      quotationFormRef.current.submit();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Btn
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            className="mr-4"
          >
            {tCommon('actions.back')}
          </Btn>
          <h1 className="text-xl font-semibold" style={{ color: `rgb(var(--color-primary-800))` }}>
            {t('actions.create')}
          </h1>
        </div>
        <Btn
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
          loading={isSaving}
        >
          {isSaving ? tCommon('actions.saving') : tCommon('actions.save')}
        </Btn>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <QuotationForm
          ref={quotationFormRef}
          quotation={null}
          onClose={handleBack}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </div>
    </div>
  );
};

export default CreateQuotationPage;