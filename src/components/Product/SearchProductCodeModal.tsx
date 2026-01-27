'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { productService, ProductKeySuggestion } from '@/services/products.service';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchProductCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
}

export default function SearchProductCodeModal({
  isOpen,
  onClose,
  onSelect,
}: SearchProductCodeModalProps) {
  const t = useTranslations('pages.products');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ProductKeySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        setError(null);
        try {
          const results = await productService.searchFromPack(searchTerm.trim());
          setSuggestions(results);
          if (results.length === 0) {
            setError(null); // No hay error, solo no hay resultados
          }
        } catch (error: any) {
          setSuggestions([]);
          // Verificar si es un error de pack no encontrado
          if (error?.response?.status === 404 || error?.message?.includes('not found')) {
            setError(t('form.searchCodeModal.noPackError', { default: 'No hay un pack de certificación activo configurado' }));
          } else {
            setError(t('form.searchCodeModal.searchError', { default: 'Error al buscar códigos. Intenta de nuevo.' }));
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setError(null);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelect = (suggestion: ProductKeySuggestion) => {
    onSelect(suggestion.key);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSuggestions([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                {t('form.searchCodeModal.title', { default: 'Buscar código de producto' })}
              </h3>
              <div className="mt-2">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('form.searchCodeModal.placeholder', { default: 'Escribe un término para buscar...' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: `rgb(var(--color-primary-300))`,
                      ['--tw-ring-color' as string]: `rgb(var(--color-primary-500))`,
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: `rgb(var(--color-primary-500))` }}></div>
                    </div>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div
                    className="mt-4 border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    style={{
                      maxHeight: '256px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: `rgb(var(--color-primary-300)) transparent`,
                    }}
                  >
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        width: 8px;
                      }
                      div::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      div::-webkit-scrollbar-thumb {
                        background-color: rgb(var(--color-primary-300));
                        border-radius: 4px;
                      }
                      div::-webkit-scrollbar-thumb:hover {
                        background-color: rgb(var(--color-primary-400));
                      }
                    `}</style>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.key}-${index}`}
                        type="button"
                        onClick={() => handleSelect(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm" style={{ color: `rgb(var(--color-primary-600))` }}>
                          {suggestion.key}
                        </div>
                        {suggestion.description && (
                          <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-center text-sm" style={{ color: `rgb(var(--color-primary-500))` }}>
                    {error}
                  </div>
                )}

                {searchTerm.trim().length >= 2 && !isSearching && !error && suggestions.length === 0 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    {t('form.searchCodeModal.noResults', { default: 'No se encontraron resultados' })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={handleClose}
            >
              {t('form.searchCodeModal.close', { default: 'Cerrar' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
