'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Reception } from '@/types/reception';
import { receptionService } from '@/services/receptions.service';
import { toastService } from '@/services/toast.service';
import { Btn } from '@/components/atoms';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ReceptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
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
        toastService.error('Error al cargar la recepción');
      }
      router.push('/dashboard/compras/lista-de-compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchReception();
    }
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
          <p className="text-gray-500">Recepción no encontrada</p>
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
            onClick={() => router.push('/dashboard/compras/lista-de-compras')}
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            Volver
          </Btn>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-primary-800))` }}>
              Recepción {reception.code}
            </h1>
            <p className="text-sm text-gray-500">
              Detalles de la recepción
            </p>
          </div>
        </div>
        
        {reception.status && (
          <Btn
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Añadir Producto
          </Btn>
        )}
      </div>

      {/* Información de la recepción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            Información General
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Código:</span>
              <p className="text-sm text-gray-900">{reception.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Fecha:</span>
              <p className="text-sm text-gray-900">{formatDate(reception.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Estado:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  reception.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {reception.status ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            Proveedor
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Nombre:</span>
              <p className="text-sm text-gray-900">{reception.provider.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Documento:</span>
              <p className="text-sm text-gray-900">{reception.document}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--color-primary-700))` }}>
            Almacén
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Nombre:</span>
              <p className="text-sm text-gray-900">{reception.warehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Monto Total:</span>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(reception.amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-primary-700))` }}>
            Productos de la Recepción
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {reception.status 
                ? 'Añade productos a esta recepción para comenzar.'
                : 'Esta recepción no tiene productos registrados.'
              }
            </p>
            {reception.status && (
              <div className="mt-6">
                <Btn
                  leftIcon={<PlusIcon className="h-5 w-5" />}
                >
                  Añadir Producto
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 