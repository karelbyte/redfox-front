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
      
            if (result && typeof result === 'object' && 'next_code' in result) {
        setSuggestedCode(result.next_code);
      } else {
        throw new Error('Invalid response format from surrogate service');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading suggestion');
      setError(error);
      setSuggestedCode('');
      
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
      
            if (result && typeof result === 'object' && 'next_code' in result) {
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

export function useClientSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('client', options);
}

export function useProductSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('product', options);
}

export function useInvoiceSurrogate(options?: UseSurrogateOptions) {
  return useSurrogate('invoice', options);
}