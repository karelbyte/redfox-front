'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Input from './Input';

export interface SearchSelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchSelectProps {
  value: string;
  onChange: (id: string) => void;
  onSearch: (term: string) => Promise<SearchSelectOption[]>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  helperText?: string;
  loadingText?: string;
  noResultsText?: string;
  noOptionsText?: string;
  className?: string;
}

const SearchSelect = ({
  value,
  onChange,
  onSearch,
  placeholder,
  label,
  disabled = false,
  error,
  required = false,
  helperText,
  loadingText,
  noResultsText,
  noOptionsText,
  className = ""
}: SearchSelectProps) => {
  const t = useTranslations('forms.components.searchSelect');
  
  // Usar traducciones por defecto si no se proporcionan textos personalizados
  const defaultLoadingText = loadingText || t('loading');
  const defaultNoResultsText = noResultsText || t('noResults');
  const defaultNoOptionsText = noOptionsText || t('noOptions');
  const defaultPlaceholder = placeholder || t('placeholder');

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchSelectOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Función para buscar opciones en el servidor
  const searchOptions = useCallback(async (term: string) => {
    try {
      setIsLoading(true);
      const results = await onSearch(term);
      setOptions(results || []);
    } catch (error) {
      console.error('Error buscando opciones:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchOptions(searchTerm);
    }, 300); // 300ms de debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchOptions]);

  // Cargar opciones iniciales cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && options.length === 0 && !searchTerm) {
      searchOptions('');
    }
  }, [isOpen, options.length, searchTerm, searchOptions]);

  // Cargar la opción seleccionada cuando cambia el value
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => opt.id === value);
      if (option) {
        setSelectedOption(option);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  // Estilos base siguiendo el tema del Select original
  const baseButtonStyles: React.CSSProperties = {
    border: `1px solid rgb(var(--color-secondary-300))`,
  };

  const errorButtonStyles: React.CSSProperties = {
    border: `1px solid rgb(var(--color-primary-500))`,
  };

  const buttonStyles = error ? { ...baseButtonStyles, ...errorButtonStyles } : baseButtonStyles;

  // Lógica de scroll condicional (igual que SelectWithAddScrolled)
  const shouldAddScroll = options.length > 8;
  const maxHeight = shouldAddScroll ? '200px' : 'auto';

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: `rgb(var(--color-primary-500))` }}
        >
          {label}
          {required && <span style={{ color: `rgb(var(--color-primary-500))` }}> *</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            appearance-none block w-full px-4 py-3 rounded-lg text-gray-900 bg-white 
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={buttonStyles}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption 
                ? selectedOption.label
                : defaultPlaceholder
              }
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <Input
                type="text"
                placeholder={t('placeholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            
            <div 
              className="overflow-hidden"
              style={{ 
                maxHeight,
                overflowY: shouldAddScroll ? 'auto' : 'visible',
                scrollbarWidth: 'thin',
                scrollbarColor: `rgb(var(--color-primary-300)) transparent`,
              }}
            >
              {/* Estilos para scrollbar webkit (igual que SelectWithAddScrolled) */}
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

              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {defaultLoadingText}
                </div>
              ) : options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {searchTerm ? defaultNoResultsText : defaultNoOptionsText}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      ${option.id === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                    `}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500">{option.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-gray-300">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default SearchSelect; 