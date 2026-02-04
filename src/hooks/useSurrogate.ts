import { useState, useEffect } from 'react';
import { surrogateService, NextCodeResponse } from '@/services/surrogate.service';
import { toastService } from '@/services/toast.service';

interface UseSurrogateOptions {
  autoLoad?: boolean;
  onError?: (error: Error) => void;
}

export function useSurrogate(code: string, options: UseSurrogateOptions = {}) {
  const { autoLoad = true, onError } = options;
  
  const [suggestedCode, setSuggestedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSuggestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await surrogateService.getNextCode(code);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (result && typeof result === 'object' && 'next_code' in result) {
        setSuggestedCode(result.next_code);
      } else {
        throw new Error('Invalid response format from surrogate service');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading suggestion');
      setError(error);
      setSuggestedCode(''); // Limpiar sugerencia en caso de error
      
      if (onError) {
        onError(error);
      } else {
        toastService.error(`Error al cargar sugerencia: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await surrogateService.useNextCode(code);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (result && typeof result === 'object' && 'next_code' in result) {
        // Actualizar la sugerencia para el próximo uso
        await loadSuggestion();
        return result.next_code;
      } else {
        throw new Error('Invalid response format from surrogate service');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error generating code');
      setError(error);
      if (onError) {
        onError(error);
      } else {
        toastService.error(`Error al generar código: ${error.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestion = () => {
    loadSuggestion();
  };

  useEffect(() => {
    if (autoLoad) {
      loadSuggestion();
    }
  }, [code, autoLoad]);

  return {
    suggestedCode,
    loading,
    error,
    generateCode,
    refreshSuggestion,
    loadSuggestion,
  };
}

// Hook específico para clientes
export function useClientSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('client', options);
}

// Hook específico para productos
export function useProductSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('product', options);
}

// Hook específico para facturas
export function useInvoiceSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('invoice', options);
}