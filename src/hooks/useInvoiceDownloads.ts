import { useState } from 'react';
import { toastService } from '@/services/toast.service';

export const useInvoicePDF = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadPDF = async (invoiceId: string) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_URL_API || '';
      const response = await fetch(`${apiUrl}/api/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      const blob = await response.blob();
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      const newWindow = window.open(url, '_blank');
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      if (!newWindow) {
        throw new Error('No se pudo abrir la nueva pestaña');
      }

      toastService.success('PDF descargado exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadPDF, isLoading };
};

export const useInvoiceXML = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadXML = async (invoiceId: string) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_URL_API || '';
      const response = await fetch(`${apiUrl}/api/invoices/${invoiceId}/xml`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el XML');
      }

      const blob = await response.blob();
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      const newWindow = window.open(url, '_blank');
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      if (!newWindow) {
        throw new Error('No se pudo abrir la nueva pestaña');
      }

      toastService.success('XML descargado exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadXML, isLoading };
};
