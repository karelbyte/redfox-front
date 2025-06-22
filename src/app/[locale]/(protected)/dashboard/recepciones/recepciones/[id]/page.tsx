'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Reception } from '@/types/reception';
import { receptionService } from '@/services/receptions.service';
import { toastService } from '@/services/toast.service';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ReceptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('pages.receptions');
  const [reception, setReception] = useState<Reception | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReception = async () => {
    try {
      setLoading(true);
      const data = await receptionService.getReceptionById(params.id as string);
      setReception(data);
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('details.errorLoading'));
      }
      router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchReception();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div 
            className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
            style={{ borderColor: `rgb(var(--color-primary-500))` }}
          ></div>
        </div>
      </div>
    );
  }

  if (!reception) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">{t('details.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Btn
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/recepciones/lista-de-recepciones`)}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            {t('details.back')}
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              {t('details.title', { code: reception.code })}
            </h1>
            <p className="text-sm text-gray-500">
              {t('details.subtitle')}
            </p>
          </div>
        </div>
        
        {reception.status && (
          <Btn
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            {t('details.addProduct')}
          </Btn>
        )}
      </div>

      {/* Información de la recepción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.generalInfo')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.code')}:</span>
              <p className="text-sm text-gray-900">{reception.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.date')}:</span>
              <p className="text-sm text-gray-900">{formatDate(reception.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.status')}:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  reception.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {reception.status ? t('status.open') : t('status.closed')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.provider')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.name')}:</span>
              <p className="text-sm text-gray-900">{reception.provider.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.document')}:</span>
              <p className="text-sm text-gray-900">{reception.document}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.warehouse')}
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.name')}:</span>
              <p className="text-sm text-gray-900">{reception.warehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">{t('details.labels.totalAmount')}:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(reception.amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
            {t('details.receptionProducts')}
          </h3>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('details.noProducts')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {reception.status 
                ? t('details.noProductsDesc')
                : t('details.noProductsClosedDesc')
              }
            </p>
            {reception.status && (
              <div className="mt-6">
                <Btn
                  leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                  {t('details.addProduct')}
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 